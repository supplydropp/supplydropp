import { databases, appwriteConfig } from "@/lib/appwrite";

export async function runSeeder() {
  console.log("🌱 Starting seed...");

  // ─── Products ───────────────────────────────
  const milk = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    "unique()",
    { name: "Fresh Milk 1L", supplier: "Mercadona", cost_price: 1.2, default_markup: 0.25, active: true }
  );

  const bread = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    "unique()",
    { name: "White Bread Loaf", supplier: "Mercadona", cost_price: 1.0, default_markup: 0.25, active: true }
  );

  const wine = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    "unique()",
    { name: "Red Wine Bottle 750ml", supplier: "Carrefour", cost_price: 5.0, default_markup: 0.4, active: true }
  );

  const cheese = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    "unique()",
    { name: "Queso Manchego 200g", supplier: "Mercadona", cost_price: 3.5, default_markup: 0.3, active: true }
  );

  const cleaner = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    "unique()",
    { name: "All-purpose Cleaner 1L", supplier: "Mercadona", cost_price: 2.5, default_markup: 0.3, active: true }
  );

  const toiletPaper = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    "unique()",
    { name: "Toilet Paper (12 pack)", supplier: "Carrefour", cost_price: 4.0, default_markup: 0.25, active: true }
  );

  const shampoo = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.productsCollectionId,
    "unique()",
    { name: "Shampoo 500ml", supplier: "Mercadona", cost_price: 3.0, default_markup: 0.3, active: true }
  );

  // ─── Guest Packs ─────────────────────────────
  const breakfastPack = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.packsCollectionId,
    "unique()",
    {
      name: "Breakfast Starter",
      price: 19.99,
      description: "Milk and bread essentials to start your day.",
      image_url: "https://via.placeholder.com/400x300.png?text=Breakfast+Pack",
      type: "guest",
      active: true,
      target_margin: 0.35,
    }
  );

  await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.packItemsCollectionId, "unique()", {
    packId: [breakfastPack.$id],
    packIdStr: breakfastPack.$id,
    productId: [milk.$id],
    productIdStr: milk.$id,
    quantity: 1,
  });
  await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.packItemsCollectionId, "unique()", {
    packId: [breakfastPack.$id],
    packIdStr: breakfastPack.$id,
    productId: [bread.$id],
    productIdStr: bread.$id,
    quantity: 1,
  });

  const tapasPack = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.packsCollectionId,
    "unique()",
    {
      name: "Tapas Night",
      price: 29.99,
      description: "Jamón, manchego, olives, wine – fridge-ready tapas pack.",
      image_url: "https://via.placeholder.com/400x300.png?text=Tapas+Night",
      type: "guest",
      active: true,
      target_margin: 0.4,
    }
  );

  await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.packItemsCollectionId, "unique()", {
    packId: [tapasPack.$id],
    packIdStr: tapasPack.$id,
    productId: [wine.$id],
    productIdStr: wine.$id,
    quantity: 1,
  });
  await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.packItemsCollectionId, "unique()", {
    packId: [tapasPack.$id],
    packIdStr: tapasPack.$id,
    productId: [cheese.$id],
    productIdStr: cheese.$id,
    quantity: 1,
  });

  // ─── Host Packs ─────────────────────────────
  const cleaningPack = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.packsCollectionId,
    "unique()",
    {
      name: "Cleaning Essentials",
      price: 15.99,
      description: "Turnover cleaning pack with cleaner, toilet paper, shampoo.",
      image_url: "https://via.placeholder.com/400x300.png?text=Cleaning+Pack",
      type: "host",
      active: true,
      target_margin: 0.3,
    }
  );

  for (const product of [cleaner, toiletPaper, shampoo]) {
    await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.packItemsCollectionId, "unique()", {
      packId: [cleaningPack.$id],
      packIdStr: cleaningPack.$id,
      productId: [product.$id],
      productIdStr: product.$id,
      quantity: 1,
    });
  }

  const turnoverPack = await databases.createDocument(
    appwriteConfig.databaseId,
    appwriteConfig.packsCollectionId,
    "unique()",
    {
      name: "Turnover Kit",
      price: 25.99,
      description: "Full turnover kit with essentials for hosts.",
      image_url: "https://via.placeholder.com/400x300.png?text=Turnover+Kit",
      type: "host",
      active: true,
      target_margin: 0.35,
    }
  );

  for (const product of [cleaner, toiletPaper, shampoo, milk, bread]) {
    await databases.createDocument(appwriteConfig.databaseId, appwriteConfig.packItemsCollectionId, "unique()", {
      packId: [turnoverPack.$id],
      packIdStr: turnoverPack.$id,
      productId: [product.$id],
      productIdStr: product.$id,
      quantity: 1,
    });
  }

  console.log("✅ Seeder finished");
}
