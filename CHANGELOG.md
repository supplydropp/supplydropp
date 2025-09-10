# Changelog

All notable changes to this project will be documented in this file.  
This project follows [Semantic Versioning](https://semver.org/).

---

## [v0.2.0] - 2025-09-10

### Added
- Cart functionality: add, remove, increase, decrease items.
- Empty cart state with new `empty-cart.png` graphic.
- "Continue shopping" button inside cart for smoother UX.
- Safe area handling for iOS (top/bottom padding fixes).
- Pagination for products and packs.
- Admin dashboard: consistent styling with `ui/Button`, `ui/TextInput`, and row-based lists.
- Store page: best sellers, packs, and products combined into a cleaner storefront.

### Changed
- Updated styling to follow brand guidelines (`#28aae2` + red accent).
- Redesigned Admin Products & Packs pages to use row layouts instead of cards.
- Improved mobile + web layout with consistent padding and spacing.
- Profile page refactored to use standardized buttons/inputs.

### Fixed
- iOS title bar overlap issues with SafeAreaView.
- Web edge padding on products/packs lists.
- Cart item removal and quantity adjustment logic.

---

## [v0.1.0] - 2025-09-05
### Added
- Seeded products, packs, and `pack_items`.
- Admin dashboard with pack details.
