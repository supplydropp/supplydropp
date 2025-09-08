import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";
import type { CreateUserParams, GetMenuParams, SignInParams } from "@/type";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!,
  platform: "com.supplydropp.provisioning",
  databaseId: "68bce2d600248f0e80dc",
  bucketId: "68643e170015edaa95d7",
  userCollectionId: "user",
  categoriesCollectionId: "68643a390017b239fa0f",
  menuCollectionId: "68643ad80027ddb96920",
  customizationsCollectionId: "68643c0300297e5abc95",
  menuCustomizationsCollectionId: "68643cd8003580ecdd8f",
};

export const client = new Client()
  .setEndpoint(appwriteConfig.endpoint)
  .setProject(appwriteConfig.projectId)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

const toError = (e: unknown) => (e instanceof Error ? e : new Error(String(e)));

/** End current session if present (safe to call anytime) */
export const signOut = async () => {
  try {
    await account.deleteSession("current");
  } catch {
    // no active session -> ignore
  }
};

/** Safe sign-in: reuse same-user session or clear and create a new one */
export const signIn = async ({ email, password }: SignInParams) => {
  const wanted = email.trim().toLowerCase();
  try {
    // Is there already a session?
    const me = await account.get().catch(() => null);

    // Same user? reuse current session
    if (me?.email?.toLowerCase() === wanted) return me;

    // Different user? clear current session first
    if (me) await account.deleteSession("current");

    // Create and RETURN the new session
    return await account.createEmailPasswordSession(wanted, password);
  } catch (e) {
    throw toError(e);
  }
};

export const createUser = async ({ email, password, name }: CreateUserParams) => {
  try {
    // Ensure clean slate so create + sign-in don't collide
    await signOut();

    const newAccount = await account.create(ID.unique(), email, password, name);
    const avatarUrl = avatars.getInitialsURL(name);

    // Create a session for the new user
    await signIn({ email, password });

    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      { email, name, accountId: newAccount.$id, avatar: avatarUrl }
    );
  } catch (e) {
    throw toError(e);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get().catch(() => null);
    if (!currentAccount) return null;

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    return currentUser.documents[0] ?? null;
  } catch (e) {
    console.log(e);
    throw toError(e);
  }
};

export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries: string[] = [];
    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query));

    const menus = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      queries
    );

    return menus.documents;
  } catch (e) {
    throw toError(e);
  }
};

export const getCategories = async () => {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId
    );

    return categories.documents;
  } catch (e) {
    throw toError(e);
  }
};
