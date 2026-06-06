<?php
/**
 * Shop Archive Page - Split into Bulk Hair and Wefted Hair sections
 */

defined('ABSPATH') || exit;

get_header();

// Get search and filter values
$search = isset($_GET['s']) ? sanitize_text_field($_GET['s']) : '';
$orderby = isset($_GET['orderby']) ? sanitize_text_field($_GET['orderby']) : 'menu_order';
?>

<!-- Shop Banner -->
<section class="shop-banner">
    <div class="container">
        <div class="banner-grid">
            <div class="banner-image-wrap">
                <img src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80" alt="Glamm Hair Collection" class="banner-image" />
                <div class="banner-overlay"></div>
                <div class="floating-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/></svg>
                    <span>New Arrivals</span>
                </div>
                <div class="banner-text-overlay">
                    <h3>Luxury Collection</h3>
                    <p>Premium virgin human hair</p>
                </div>
            </div>
            <div class="banner-content">
                <div class="offer-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    <span>Limited Time Offer</span>
                </div>
                <div class="banner-title">
                    <span class="title-line">Get 20% Off</span>
                    <span class="title-gradient">Your First Order</span>
                </div>
                <p class="banner-desc">
                    Experience the luxury of 100% virgin human hair extensions.
                    <span class="free-ship">✨ Free shipping on orders over $150</span>
                </p>
                <ul class="banner-features">
                    <li><span class="feature-icon"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span><span>100% Virgin Human Hair</span></li>
                    <li><span class="feature-icon"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span><span>Lasts 2+ years with proper care</span></li>
                    <li><span class="feature-icon"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg></span><span>30-day money back guarantee</span></li>
                </ul>
                <div class="banner-buttons">
                    <a href="#bulk-hair" class="btn-shop-now">Shop Bulk Hair <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
                    <a href="#wefted-hair" class="btn-advice">Shop Wefted Hair</a>
                </div>
            </div>
        </div>
    </div>
</section>

<!-- Main Shop Section -->
<section class="shop-section">
    <div class="container">
        <div class="shop-header">
            <h1 class="section-title">Shop All Extensions</h1>
            <p class="section-sub">Browse our complete collection of premium hair extensions</p>
        </div>

        <form class="search-filter-bar" method="get" action="<?php echo esc_url(wc_get_page_permalink('shop')); ?>">
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
        </form>

        <?php
        // Get all products
        $all_args = array('post_type' => 'product', 'posts_per_page' => -1, 'post_status' => 'publish', 's' => $search);
        $all_query = new WP_Query($all_args);
        
        $bulk_products = array();
        $wefted_products = array();
        
        if ($all_query->have_posts()) {
            while ($all_query->have_posts()) {
                $all_query->the_post();
                $product_name = strtolower(get_the_title());
                if (strpos($product_name, 'bulk') !== false) {
                    $bulk_products[] = get_the_ID();
                } else {
                    $wefted_products[] = get_the_ID();
                }
            }
            wp_reset_postdata();
        }
        ?>

        <!-- BULK HAIR SECTION -->
        <div id="bulk-hair" class="product-section">
            <div class="section-header-row">
                <div class="section-header-content">
                    <h2 class="product-section-title">Bulk Hair</h2>
                    <p class="product-section-desc">Premium bulk hair for braiding and custom installations.</p>
                </div>
                <span class="product-count"><?php echo count($bulk_products); ?> Products</span>
            </div>
            
            <?php if (!empty($bulk_products)): ?>
            <div class="products-grid">
                <?php 
                foreach ($bulk_products as $pid):
                    $product = wc_get_product($pid);
                    if (!$product) continue;
                    $title = $product->get_name();
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id($pid), 'large');
                    $image_url = $image ? $image[0] : 'https://via.placeholder.com/400x500';
                    $permalink = get_permalink($pid);
                    $cats = get_the_terms($pid, 'product_cat');
                    $cat_name = $cats && !is_wp_error($cats) ? $cats[0]->name : 'Bulk Hair';
                    $min_price = $product->get_price();
                    if (function_exists('glamm_get_product_sizes_prices')) {
                        $sizes_prices = glamm_get_product_sizes_prices($pid, $cat_name);
                        if (!empty($sizes_prices)) $min_price = min($sizes_prices);
                    }
                ?>
                <?php include(get_template_directory() . '/woocommerce/product-card.php'); ?>
                <?php endforeach; ?>
            </div>
            <?php else: ?>
            <div class="no-products"><p>No bulk hair products found.</p></div>
            <?php endif; ?>
        </div>

        <!-- WEFTED HAIR SECTION -->
        <div id="wefted-hair" class="product-section">
            <div class="section-header-row">
                <div class="section-header-content">
                    <h2 class="product-section-title">Wefted Hair</h2>
                    <p class="product-section-desc">Ready-to-install wefted bundles, closures, and frontals.</p>
                </div>
                <span class="product-count"><?php echo count($wefted_products); ?> Products</span>
            </div>
            
            <?php if (!empty($wefted_products)): ?>
            <div class="products-grid">
                <?php 
                foreach ($wefted_products as $pid):
                    $product = wc_get_product($pid);
                    if (!$product) continue;
                    $title = $product->get_name();
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id($pid), 'large');
                    $image_url = $image ? $image[0] : 'https://via.placeholder.com/400x500';
                    $permalink = get_permalink($pid);
                    $cats = get_the_terms($pid, 'product_cat');
                    $cat_name = $cats && !is_wp_error($cats) ? $cats[0]->name : 'Wefted Hair';
                    $min_price = $product->get_price();
                    if (function_exists('glamm_get_product_sizes_prices')) {
                        $sizes_prices = glamm_get_product_sizes_prices($pid, $cat_name);
                        if (!empty($sizes_prices)) $min_price = min($sizes_prices);
                    }
                ?>
                <?php include(get_template_directory() . '/woocommerce/product-card.php'); ?>
                <?php endforeach; ?>
            </div>
            <?php else: ?>
            <div class="no-products"><p>No wefted hair products found.</p></div>
            <?php endif; ?>
        </div>
    </div>
</section>

<?php get_footer(); ?>

