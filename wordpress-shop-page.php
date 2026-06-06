<?php
/**
 * Complete Shop Page - Matching Next.js Design
 * Self-contained with all styles inline
 */
defined('ABSPATH') || exit;
get_header();

$search = isset($_GET['s']) ? sanitize_text_field($_GET['s']) : '';
$category = isset($_GET['product_cat']) ? sanitize_text_field($_GET['product_cat']) : '';
$orderby = isset($_GET['orderby']) ? sanitize_text_field($_GET['orderby']) : 'menu_order';

// Get all categories
$product_categories = get_terms(array('taxonomy' => 'product_cat', 'hide_empty' => true));

// Build product query
$args = array(
    'post_type' => 'product',
    'posts_per_page' => -1,
    'post_status' => 'publish',
    's' => $search
);

if ($category) {
    $args['tax_query'] = array(array(
        'taxonomy' => 'product_cat',
        'field' => 'slug',
        'terms' => $category
    ));
}

switch ($orderby) {
    case 'price':
        $args['meta_key'] = '_price';
        $args['orderby'] = 'meta_value_num';
        $args['order'] = 'ASC';
        break;
    case 'price-desc':
        $args['meta_key'] = '_price';
        $args['orderby'] = 'meta_value_num';
        $args['order'] = 'DESC';
        break;
    case 'title':
        $args['orderby'] = 'title';
        $args['order'] = 'ASC';
        break;
}

$products_query = new WP_Query($args);
$total_products = $products_query->found_posts;
?>

<style>
/* ========== SHOP PAGE COMPLETE STYLES ========== */
:root {
    --accent: #B76E79;
    --accent-dark: #9B5A63;
    --text-dark: #2C2C2C;
    --text-muted: #6B6B6B;
    --bg-cream: #FAF8F5;
    --bg-white: #FFFFFF;
    --border: #E5E5E5;
    --gold: #C9A96E;
}

.shop-container { max-width: 1400px; margin: 0 auto; padding: 0 1.5rem; }

/* ===== BANNER ===== */
.shop-banner {
    background: linear-gradient(135deg, rgba(183,110,121,0.05), var(--bg-cream), rgba(183,110,121,0.1));
    padding: 4rem 0;
}
.banner-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
    align-items: center;
}
@media (max-width: 1024px) {
    .banner-grid { grid-template-columns: 1fr; }
}
.banner-image-wrap {
    position: relative;
    height: 500px;
    border-radius: 1.5rem;
    overflow: hidden;
    box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);
}
.banner-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.7s;
}
.banner-image-wrap:hover .banner-image { transform: scale(1.05); }
.banner-image-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.2), transparent);
}
.banner-floating-badge {
    position: absolute;
    top: 2rem;
    left: 2rem;
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(10px);
    padding: 0.75rem 1.5rem;
    border-radius: 9999px;
    box-shadow: 0 10px 40px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}
.banner-floating-badge svg { width: 20px; height: 20px; color: var(--accent); fill: var(--accent); }
.banner-floating-badge span { font-weight: 700; color: var(--accent); text-transform: uppercase; font-size: 0.875rem; letter-spacing: 0.05em; }
.banner-bottom-text {
    position: absolute;
    bottom: 2rem;
    left: 2rem;
    right: 2rem;
}
.banner-bottom-text h3 { font-size: 2rem; font-weight: 700; color: white; margin-bottom: 0.5rem; }
.banner-bottom-text p { color: rgba(255,255,255,0.9); font-size: 1.125rem; }

.banner-content { display: flex; flex-direction: column; gap: 1.5rem; }
.offer-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    background: rgba(183,110,121,0.1);
    border: 1px solid rgba(183,110,121,0.3);
    border-radius: 9999px;
    width: fit-content;
}
.offer-badge svg { width: 16px; height: 16px; color: var(--accent); fill: var(--accent); }
.offer-badge span { font-size: 0.875rem; font-weight: 700; color: var(--accent); text-transform: uppercase; letter-spacing: 0.05em; }
.banner-title { font-size: 3rem; font-weight: 800; line-height: 1.1; }
.banner-title-line { display: block; color: var(--text-dark); margin-bottom: 0.5rem; }
.banner-title-gradient {
    display: block;
    background: linear-gradient(90deg, var(--accent), var(--accent-dark), var(--accent));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
}
@media (max-width: 768px) { .banner-title { font-size: 2rem; } }
.banner-desc { font-size: 1.25rem; color: rgba(44,44,44,0.8); line-height: 1.6; }
.banner-desc-highlight { display: block; margin-top: 0.5rem; font-weight: 600; color: var(--accent); }
.banner-features { list-style: none; padding: 0; margin: 1rem 0; display: flex; flex-direction: column; gap: 1rem; }
.banner-features li { display: flex; align-items: flex-start; gap: 0.75rem; }
.feature-icon-wrap { margin-top: 0.25rem; padding: 0.25rem; background: rgba(183,110,121,0.1); border-radius: 9999px; }
.feature-icon-wrap svg { width: 16px; height: 16px; color: var(--accent); fill: var(--accent); }
.banner-features span { color: rgba(44,44,44,0.9); font-weight: 500; }
.banner-buttons { display: flex; flex-wrap: wrap; gap: 1rem; padding-top: 1.5rem; }
.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    background: linear-gradient(90deg, var(--accent), var(--accent-dark));
    color: white;
    font-weight: 700;
    font-size: 1.125rem;
    border-radius: 9999px;
    text-decoration: none;
    box-shadow: 0 10px 40px rgba(183,110,121,0.5);
    transition: all 0.3s;
}
.btn-primary:hover { transform: scale(1.05); box-shadow: 0 15px 50px rgba(183,110,121,0.6); }
.btn-primary svg { width: 20px; height: 20px; transition: transform 0.3s; }
.btn-primary:hover svg { transform: translateX(4px); }
.btn-secondary {
    display: inline-flex;
    align-items: center;
    gap: 0.75rem;
    padding: 1rem 2rem;
    border: 2px solid rgba(183,110,121,0.6);
    color: var(--accent);
    font-weight: 700;
    font-size: 1.125rem;
    border-radius: 9999px;
    text-decoration: none;
    transition: all 0.3s;
    background: transparent;
}
.btn-secondary:hover { background: var(--accent); color: white; }
</style>

<!-- SHOP BANNER -->
<section class="shop-banner">
    <div class="shop-container">
        <div class="banner-grid">
            <div class="banner-image-wrap">
                <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80" alt="Hair Extensions" class="banner-image" />
                <div class="banner-image-overlay"></div>
                <div class="banner-floating-badge">
                    <svg viewBox="0 0 24 24"><path d="M12 3l1.5 4.5h4.5l-3.5 2.5 1.5 4.5-4-3-4 3 1.5-4.5-3.5-2.5h4.5z"/></svg>
                    <span>New Arrivals</span>
                </div>
                <div class="banner-bottom-text">
                    <h3>Luxury Collection</h3>
                    <p>Premium virgin hair extensions</p>
                </div>
            </div>
            <div class="banner-content">
                <div class="offer-badge">
                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span>Limited Time Offer</span>
                </div>
                <h2 class="banner-title">
                    <span class="banner-title-line">Get 20% Off</span>
                    <span class="banner-title-gradient">Your First Order</span>
                </h2>
                <p class="banner-desc">
                    Transform your look with our premium collection of 100% virgin human hair extensions.
                    <span class="banner-desc-highlight">Free shipping on orders over $100.</span>
                </p>
                <ul class="banner-features">
                    <li><span class="feature-icon-wrap"><svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span><span>Premium Quality - 100% Virgin Human Hair</span></li>
                    <li><span class="feature-icon-wrap"><svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span><span>Natural Look - Blends Seamlessly</span></li>
                    <li><span class="feature-icon-wrap"><svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span><span>Long Lasting - Up to 12 Months</span></li>
                </ul>
                <div class="banner-buttons">
                    <a href="#products" class="btn-primary">
                        Shop Now
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </a>
                    <a href="/contact" class="btn-secondary">Get Expert Advice</a>
                </div>
            </div>
        </div>
    </div>
</section>

<style>
/* ===== MAIN SHOP SECTION ===== */
.shop-main { padding: 4rem 0; background: var(--bg-white); }
.shop-header { text-align: center; margin-bottom: 3rem; }
.shop-title { font-size: 2.5rem; font-weight: 700; color: var(--text-dark); margin-bottom: 0.5rem; }
.shop-subtitle { color: var(--text-muted); font-size: 1.125rem; max-width: 600px; margin: 0 auto; }

/* Search & Filter Bar */
.filter-bar { display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 2rem; }
.search-wrap { flex: 1; min-width: 250px; position: relative; }
.search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); width: 20px; height: 20px; color: var(--text-muted); }
.search-input {
    width: 100%;
    padding: 0.875rem 1rem 0.875rem 3rem;
    border: 2px solid var(--border);
    border-radius: 9999px;
    font-size: 0.875rem;
    outline: none;
    transition: border-color 0.3s;
}
.search-input:focus { border-color: var(--accent); }
.sort-select {
    padding: 0.875rem 1.5rem;
    border: 2px solid var(--border);
    border-radius: 9999px;
    font-size: 0.875rem;
    outline: none;
    cursor: pointer;
    background: white;
    transition: border-color 0.3s;
}
.sort-select:focus { border-color: var(--accent); }
.filter-toggle {
    display: none;
    padding: 0.875rem 1.5rem;
    border: 2px solid var(--border);
    border-radius: 9999px;
    background: white;
    font-weight: 600;
    cursor: pointer;
    align-items: center;
    gap: 0.5rem;
}
@media (max-width: 768px) { .filter-toggle { display: flex; } }

/* Layout */
.shop-layout { display: grid; grid-template-columns: 280px 1fr; gap: 2rem; }
@media (max-width: 1024px) { .shop-layout { grid-template-columns: 1fr; } }

/* Sidebar */
.shop-sidebar { position: sticky; top: 6rem; height: fit-content; }
@media (max-width: 1024px) {
    .shop-sidebar { display: none; }
    .shop-sidebar.active { display: block; }
}
.sidebar-card {
    background: white;
    border-radius: 1rem;
    padding: 1.5rem;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    border: 1px solid var(--border);
}
.sidebar-title { font-size: 1.125rem; font-weight: 700; margin-bottom: 1.5rem; color: var(--text-dark); }
.filter-section { margin-bottom: 2rem; }
.filter-label { font-weight: 600; margin-bottom: 1rem; display: block; color: var(--text-dark); }
.category-list { display: flex; flex-direction: column; gap: 0.5rem; }
.category-btn {
    width: 100%;
    text-align: left;
    padding: 0.625rem 1rem;
    border-radius: 0.5rem;
    border: none;
    background: transparent;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
    color: var(--text-dark);
}
.category-btn:hover { background: var(--bg-cream); }
.category-btn.active { background: var(--accent); color: white; }
.price-slider { width: 100%; accent-color: var(--accent); }
.price-range { display: flex; justify-content: space-between; font-size: 0.875rem; color: var(--text-muted); margin-top: 0.5rem; }
.clear-filters-btn {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid var(--border);
    border-radius: 0.5rem;
    background: transparent;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 0.875rem;
}
.clear-filters-btn:hover { background: var(--bg-cream); }

/* Products Section */
.products-section {}
.products-count { color: var(--text-muted); margin-bottom: 1.5rem; }
.products-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1.5rem; }

/* Product Card */
.product-card {
    background: white;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    transition: all 0.3s;
    border: 1px solid var(--border);
    position: relative;
}
.product-card:hover { transform: translateY(-8px); box-shadow: 0 20px 40px rgba(183,110,121,0.2); }
.product-card::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, var(--accent), var(--gold));
    border-radius: 1.1rem;
    opacity: 0;
    transition: opacity 0.3s;
    z-index: -1;
}
.product-card:hover::before { opacity: 1; }
.product-card-link { text-decoration: none; color: inherit; display: block; }
.product-image-container { position: relative; aspect-ratio: 3/4; overflow: hidden; }
.product-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.product-card:hover .product-image { transform: scale(1.1); }
.product-badge {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: var(--accent);
    color: white;
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
}
.quick-actions {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.3s;
}
.product-card:hover .quick-actions { opacity: 1; transform: translateX(0); }
.quick-btn {
    width: 40px;
    height: 40px;
    background: white;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: all 0.2s;
}
.quick-btn:hover { background: var(--accent); color: white; }
.quick-btn svg { width: 18px; height: 18px; }
.product-info { padding: 1.25rem; }
.product-category { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--accent); font-weight: 600; }
.product-rating { display: flex; gap: 2px; margin: 0.5rem 0; }
.product-rating svg { width: 14px; height: 14px; color: var(--gold); fill: var(--gold); }
.product-name { font-size: 1.125rem; font-weight: 700; color: var(--text-dark); margin-bottom: 0.75rem; line-height: 1.3; }
.price-box { background: var(--bg-cream); padding: 0.75rem; border-radius: 0.5rem; margin-bottom: 0.75rem; }
.price-label { font-size: 0.75rem; color: var(--text-muted); }
.price-value { font-size: 1.25rem; font-weight: 700; color: var(--accent); }
.product-tags { display: flex; flex-wrap: wrap; gap: 0.5rem; }
.product-tag { font-size: 0.75rem; padding: 0.25rem 0.5rem; background: var(--bg-cream); border-radius: 0.25rem; color: var(--text-muted); }

.no-products { text-align: center; padding: 4rem 2rem; background: var(--bg-cream); border-radius: 1rem; }
.no-products p { color: var(--text-muted); font-size: 1.125rem; margin-bottom: 1rem; }
</style>

<!-- MAIN SHOP SECTION -->
<section id="products" class="shop-main">
    <div class="shop-container">
        <div class="shop-header">
            <h1 class="shop-title">Shop All Extensions</h1>
            <p class="shop-subtitle">Browse our complete collection of premium hair extensions</p>
        </div>

        <form class="filter-bar" method="get" action="<?php echo esc_url(wc_get_page_permalink('shop')); ?>">
            <div class="search-wrap">
                <svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                <input type="text" name="s" class="search-input" placeholder="Search products..." value="<?php echo esc_attr($search); ?>" />
            </div>
            <select name="orderby" class="sort-select" onchange="this.form.submit()">
                <option value="menu_order" <?php selected($orderby, 'menu_order'); ?>>Featured</option>
                <option value="price" <?php selected($orderby, 'price'); ?>>Price: Low to High</option>
                <option value="price-desc" <?php selected($orderby, 'price-desc'); ?>>Price: High to Low</option>
                <option value="title" <?php selected($orderby, 'title'); ?>>Name: A-Z</option>
            </select>
            <button type="button" class="filter-toggle" onclick="document.querySelector('.shop-sidebar').classList.toggle('active')">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/></svg>
                Filters
            </button>
            <?php if ($category): ?><input type="hidden" name="product_cat" value="<?php echo esc_attr($category); ?>" /><?php endif; ?>
        </form>

        <div class="shop-layout">
            <!-- SIDEBAR -->
            <aside class="shop-sidebar">
                <div class="sidebar-card">
                    <h3 class="sidebar-title">Filters</h3>

                    <div class="filter-section">
                        <span class="filter-label">Category</span>
                        <div class="category-list">
                            <a href="<?php echo esc_url(remove_query_arg('product_cat')); ?>" class="category-btn <?php echo !$category ? 'active' : ''; ?>">
                                All Products (<?php echo $total_products; ?>)
                            </a>
                            <?php foreach ($product_categories as $cat): ?>
                            <a href="<?php echo esc_url(add_query_arg('product_cat', $cat->slug)); ?>" class="category-btn <?php echo $category === $cat->slug ? 'active' : ''; ?>">
                                <?php echo esc_html($cat->name); ?> (<?php echo $cat->count; ?>)
                            </a>
                            <?php endforeach; ?>
                        </div>
                    </div>

                    <div class="filter-section">
                        <span class="filter-label">Price Range</span>
                        <input type="range" class="price-slider" min="0" max="300" value="300" />
                        <div class="price-range"><span>$0</span><span>$300</span></div>
                    </div>

                    <a href="<?php echo esc_url(wc_get_page_permalink('shop')); ?>" class="clear-filters-btn">Clear All Filters</a>
                </div>
            </aside>

            <!-- PRODUCTS GRID -->
            <div class="products-section">
                <p class="products-count">Showing <?php echo $products_query->found_posts; ?> products</p>

                <?php if ($products_query->have_posts()): ?>
                <div class="products-grid">
                    <?php while ($products_query->have_posts()): $products_query->the_post();
                        global $product;
                        if (!$product) continue;
                        $pid = get_the_ID();
                        $title = get_the_title();
                        $image = wp_get_attachment_image_src(get_post_thumbnail_id($pid), 'large');
                        $image_url = $image ? $image[0] : 'https://via.placeholder.com/400x500';
                        $permalink = get_permalink();
                        $cats = get_the_terms($pid, 'product_cat');
                        $cat_name = $cats && !is_wp_error($cats) ? $cats[0]->name : 'Hair Extensions';
                        $min_price = $product->get_price();
                        if (function_exists('glamm_get_product_sizes_prices')) {
                            $sizes_prices = glamm_get_product_sizes_prices($pid, $cat_name);
                            if (!empty($sizes_prices)) $min_price = min($sizes_prices);
                        }
                    ?>
                    <div class="product-card">
                        <a href="<?php echo esc_url($permalink); ?>" class="product-card-link">
                            <div class="product-image-container">
                                <img src="<?php echo esc_url($image_url); ?>" alt="<?php echo esc_attr($title); ?>" class="product-image" />
                                <span class="product-badge">Best Seller</span>
                                <div class="quick-actions">
                                    <button type="button" class="quick-btn" title="Quick View"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg></button>
                                    <button type="button" class="quick-btn" title="Add to Wishlist"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg></button>
                                </div>
                            </div>
                            <div class="product-info">
                                <span class="product-category"><?php echo esc_html($cat_name); ?></span>
                                <div class="product-rating">
                                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                    <svg viewBox="0 0 24 24"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                                </div>
                                <h3 class="product-name"><?php echo esc_html($title); ?></h3>
                                <div class="price-box">
                                    <div class="price-label">Starting at</div>
                                    <div class="price-value">$<?php echo number_format((float)$min_price, 2); ?></div>
                                </div>
                                <div class="product-tags">
                                    <span class="product-tag">100% Human Hair</span>
                                    <span class="product-tag">Premium</span>
                                </div>
                            </div>
                        </a>
                    </div>
                    <?php endwhile; wp_reset_postdata(); ?>
                </div>
                <?php else: ?>
                <div class="no-products">
                    <p>No products found matching your criteria.</p>
                    <a href="<?php echo esc_url(wc_get_page_permalink('shop')); ?>" class="btn-primary">View All Products</a>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</section>

<?php get_footer(); ?>

