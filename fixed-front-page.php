<?php get_header(); ?>

<?php
// Lucy photos for gallery
$lucy_photos = array(
    array('src' => '/images/lucy-photos/_F8A0262-Edit.jpg', 'likes' => 1243, 'comments' => 89),
    array('src' => '/images/lucy-photos/_F8A0263-Edit.jpg', 'likes' => 2156, 'comments' => 134),
    array('src' => '/images/lucy-photos/_F8A0287-Edit.jpg', 'likes' => 1876, 'comments' => 112),
    array('src' => '/images/lucy-photos/_F8A0291-Edit.jpg', 'likes' => 3421, 'comments' => 201),
    array('src' => '/images/lucy-photos/_F8A0317-Edit.jpg', 'likes' => 2987, 'comments' => 178),
    array('src' => '/images/lucy-photos/_F8A0333-Edit.jpg', 'likes' => 1654, 'comments' => 95),
    array('src' => '/images/lucy-photos/_F8A0346-Edit.jpg', 'likes' => 2234, 'comments' => 143),
    array('src' => '/images/lucy-photos/_F8A0376-Edit.jpg', 'likes' => 1987, 'comments' => 121),
);

// Testimonials data
$testimonials = array(
    array(
        'name' => 'Sarah Johnson',
        'location' => 'Los Angeles, CA',
        'text' => "These extensions are AMAZING! I've tried so many brands, but Glamm Hair is by far the best. The quality is incredible, and they blend perfectly with my natural hair.",
        'image' => 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80'
    ),
    array(
        'name' => 'Michelle Davis',
        'location' => 'New York, NY',
        'text' => "I was skeptical at first, but these extensions exceeded all my expectations. No shedding, super soft, and they last forever! My confidence has skyrocketed.",
        'image' => 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80'
    ),
    array(
        'name' => 'Jessica Williams',
        'location' => 'Miami, FL',
        'text' => "Best investment I've ever made! The curly extensions match my natural texture perfectly. Everyone thinks it's my real hair!",
        'image' => 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80'
    ),
);
?>

<!-- HERO SECTION -->
<section class="hero-section">
    <div class="hero-bg">
        <div class="hero-parallax">
            <img src="<?php echo get_template_directory_uri(); ?>/images/lucy-photos/_F8A0531-Edit.jpg" alt="Glamm Hair Extensions" class="hero-bg-image" />
        </div>
        <div class="hero-overlay-right"></div>
        <div class="hero-overlay-top"></div>
        <div class="hero-glow hero-glow-coral"></div>
        <div class="hero-glow hero-glow-gold"></div>
    </div>
    
    <div class="container-max hero-container">
        <div class="hero-content-wrapper">
            <div class="hero-badge">
                <svg class="hero-badge-icon" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                <span>100% Virgin Human Hair</span>
            </div>
            
            <div class="hero-headline">
                <h1 class="hero-title">
                    <span class="hero-title-white">Transform Your</span>
                    <span class="hero-title-gradient">Natural Beauty</span>
                </h1>
            </div>
            
            <p class="hero-subtitle">
                Premium hair extensions crafted for the modern woman.
                <span class="hero-subtitle-accent">Luxurious • Natural • Effortlessly Stunning</span>
            </p>
            
            <div class="hero-buttons">
                <a href="<?php echo home_url('/shop/'); ?>" class="btn btn-hero-primary">
                    <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 10a4 4 0 0 1-8 0"></path><path d="M3.4 5.467a2 2 0 0 0-.4 1.2V20a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6.667a2 2 0 0 0-.4-1.2l-2-2.667A2 2 0 0 0 17 2H7a2 2 0 0 0-1.6.8z"></path></svg>
                    <span>Shop Collection</span>
                    <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </a>
                <a href="#about" class="btn btn-hero-secondary">
                    <span>Discover More</span>
                    <svg class="btn-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
                </a>
            </div>
            
            <div class="hero-trust">
                <div class="trust-item">
                    <div class="trust-icon-wrap"><svg class="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526"></path><circle cx="12" cy="8" r="6"></circle></svg></div>
                    <div class="trust-value">100%</div>
                    <div class="trust-label">Premium Quality</div>
                </div>
                <div class="trust-item">
                    <div class="trust-icon-wrap"><svg class="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"></path><path d="M15 18H9"></path><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"></path><circle cx="17" cy="18" r="2"></circle><circle cx="7" cy="18" r="2"></circle></svg></div>
                    <div class="trust-value">Free</div>
                    <div class="trust-label">Shipping</div>
                </div>
                <div class="trust-item">
                    <div class="trust-icon-wrap"><svg class="trust-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"></path></svg></div>
                    <div class="trust-value">30-Day</div>
                    <div class="trust-label">Guarantee</div>
                </div>
            </div>
            
            <div class="hero-social-proof">
                <div class="avatar-stack"><div class="avatar"></div><div class="avatar"></div><div class="avatar"></div><div class="avatar"></div></div>
                <div class="social-proof-text">
                    <div class="stars">
                        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                        <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
                    </div>
                    <p><strong>5,000+</strong> Happy Customers</p>
                </div>
            </div>
        </div>
    </div>
    
    <div class="scroll-indicator"><div class="scroll-mouse"><div class="scroll-dot"></div></div></div>
</section>

<!-- LUCY GALLERY SECTION -->
<section class="section lucy-gallery-section">
    <div class="container-max">
        <div class="text-center mb-12">
            <div class="gallery-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                <span>Follow Our Journey</span>
            </div>
            <h2 class="gallery-title">See The <span class="gradient-text">Glamm Difference</span></h2>
            <p class="gallery-subtitle">Real hair, real transformations, real confidence. Join thousands of women who've discovered their perfect look.</p>
            <a href="https://instagram.com/glammhair" target="_blank" rel="noopener" class="instagram-handle">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                @glammhair
            </a>
        </div>

        <div class="lucy-grid">
            <?php foreach ($lucy_photos as $index => $photo): ?>
            <div class="lucy-item">
                <img src="<?php echo get_template_directory_uri() . $photo['src']; ?>" alt="Glamm Hair Showcase <?php echo $index + 1; ?>" loading="lazy" />
                <div class="lucy-overlay">
                    <div class="lucy-stats">
                        <span><svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg> <?php echo number_format($photo['likes']); ?></span>
                        <span><svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg> <?php echo $photo['comments']; ?></span>
                    </div>
                </div>
                <div class="lucy-ig-badge">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect></svg>
                </div>
            </div>
            <?php endforeach; ?>
        </div>

        <div class="text-center mt-8">
            <a href="https://instagram.com/glammhair" target="_blank" rel="noopener" class="btn-instagram">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path></svg>
                Follow Us on Instagram
            </a>
        </div>
    </div>
</section>

<!-- FEATURED PRODUCTS SECTION -->
<section class="section products-section" id="products">
    <div class="container-max">
        <div class="section-header">
            <h2 class="section-label">OUR TOP PICKS</h2>
            <h3 class="section-title">FOR EVERY VIBE</h3>
            <p class="section-subtitle">Whether you're feeling those bouncy curls, sleek straight locks, or effortless waves, we've got your dream hair covered.</p>
        </div>
        
        <div class="category-tabs">
            <a href="<?php echo home_url('/shop/'); ?>" class="cat-tab active">All Products</a>
            <a href="<?php echo home_url('/shop/?filter=wavy'); ?>" class="cat-tab">Wavy</a>
            <a href="<?php echo home_url('/shop/?filter=straight'); ?>" class="cat-tab">Straight</a>
            <a href="<?php echo home_url('/shop/?filter=curly'); ?>" class="cat-tab">Curly</a>
            <a href="<?php echo home_url('/shop/?filter=closures'); ?>" class="cat-tab">Closures</a>
        </div>
        
        <div class="products-grid home-grid">
            <?php
            $args = array(
                'post_type' => 'product',
                'posts_per_page' => 8,
                'orderby' => 'menu_order',
                'order' => 'ASC'
            );
            $products = new WP_Query($args);
            
            if ($products->have_posts()) :
                while ($products->have_posts()) : $products->the_post();
                    global $product;
                    $product_id = get_the_ID();
                    $image = wp_get_attachment_image_src(get_post_thumbnail_id(), 'large');
                    $image_url = $image ? $image[0] : get_template_directory_uri() . '/images/placeholder.jpg';
                    
                    // Get category
                    $cats = get_the_terms($product_id, 'product_cat');
                    $cat_name = ($cats && !is_wp_error($cats)) ? $cats[0]->name : 'Hair Extensions';
                    
                    // Get minimum price using theme function
                    $min_price = $product->get_price();
                    if (function_exists('glamm_get_product_sizes_prices')) {
                        $sizes_prices = glamm_get_product_sizes_prices($product_id, $cat_name);
                        if (!empty($sizes_prices)) {
                            $min_price = min($sizes_prices);
                        }
                    }
                    ?>
                    <div class="product-card">
                        <a href="<?php the_permalink(); ?>" class="product-card-link">
                            <div class="product-card-glow"></div>
                            <div class="product-image-wrap">
                                <img src="<?php echo esc_url($image_url); ?>" alt="<?php the_title_attribute(); ?>" class="product-image" loading="lazy" />
                                <div class="product-badge">Best Seller</div>
                                <div class="product-quick-actions">
                                    <button type="button" class="quick-action-btn" title="Quick View"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"></path><circle cx="12" cy="12" r="3"></circle></svg></button>
                                    <button type="button" class="quick-action-btn wishlist-btn" title="Add to Wishlist"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path></svg></button>
                                </div>
                            </div>
                            <div class="product-info">
                                <span class="product-category"><?php echo esc_html($cat_name); ?></span>
                                <h3 class="product-title"><?php the_title(); ?></h3>
                                <div class="price-box">
                                    <div class="price-label">Starting at</div>
                                    <div class="price-value">$<?php echo number_format((float)$min_price, 2); ?></div>
                                </div>
                                <div class="product-meta">
                                    <span class="in-stock">✓ In Stock</span>
                                    <span class="free-shipping">🚚 Free Shipping</span>
                                </div>
                            </div>
                        </a>
                        <div class="product-card-cta">
                            <a href="<?php the_permalink(); ?>" class="select-options-btn">Select Options</a>
                        </div>
                    </div>
                <?php endwhile; wp_reset_postdata(); ?>
            <?php else : ?>
                <p class="no-products">No products found.</p>
            <?php endif; ?>
        </div>
        
        <div class="section-cta">
            <a href="<?php echo home_url('/shop/'); ?>" class="btn btn-primary">View All Products</a>
        </div>
    </div>
</section>

<!-- WHY CHOOSE US SECTION -->
<section class="section features-section">
    <div class="container-max">
        <div class="text-center mb-12">
            <h2 class="features-title">Why Choose Glamm Hair?</h2>
            <p class="features-subtitle">Premium quality extensions designed for the modern woman who demands excellence</p>
        </div>

        <div class="features-grid">
            <div class="feature-card">
                <div class="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3>NO SHEDDING</h3>
                <p>Effortlessly enhance your natural hair with added length and volume—without worrying about shedding.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>
                </div>
                <h3>SOFT & SLEEK</h3>
                <p>Luxuriously soft and silky, these extensions conform to your head's natural curvature for a seamless fit.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
                </div>
                <h3>NATURAL TEXTURE</h3>
                <p>Designed to blend flawlessly with your own hair, ensuring a natural and undetectable finish.</p>
            </div>
            <div class="feature-card">
                <div class="feature-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                </div>
                <h3>DURABLE, LONG-LASTING</h3>
                <p>Crafted from 100% real human hair, these extensions are built to last, maintaining their beauty over time.</p>
            </div>
        </div>
    </div>
</section>

<!-- TESTIMONIALS SECTION -->
<section class="section testimonials-section">
    <div class="container-max">
        <div class="text-center mb-12">
            <h2 class="testimonials-title">What Our Customers Say</h2>
            <p class="testimonials-subtitle">Real reviews from real women who love their hair</p>
        </div>

        <div class="testimonials-grid">
            <?php foreach ($testimonials as $testimonial): ?>
            <div class="testimonial-card">
                <div class="testimonial-stars">
                    <?php for ($i = 0; $i < 5; $i++): ?>
                    <svg viewBox="0 0 20 20" fill="currentColor"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                    <?php endfor; ?>
                </div>
                <p class="testimonial-text">"<?php echo esc_html($testimonial['text']); ?>"</p>
                <div class="testimonial-author">
                    <img src="<?php echo esc_url($testimonial['image']); ?>" alt="<?php echo esc_attr($testimonial['name']); ?>" />
                    <div>
                        <strong><?php echo esc_html($testimonial['name']); ?></strong>
                        <span><?php echo esc_html($testimonial['location']); ?></span>
                    </div>
                </div>
            </div>
            <?php endforeach; ?>
        </div>

        <div class="trust-stats">
            <div class="trust-stat"><div class="stat-value">5,000+</div><div class="stat-label">Happy Customers</div></div>
            <div class="trust-stat"><div class="stat-value">4.9★</div><div class="stat-label">Average Rating</div></div>
            <div class="trust-stat"><div class="stat-value">100%</div><div class="stat-label">Real Human Hair</div></div>
            <div class="trust-stat"><div class="stat-value">24/7</div><div class="stat-label">Customer Support</div></div>
        </div>
    </div>
</section>

<!-- NEWSLETTER SECTION -->
<section class="section newsletter-section">
    <div class="newsletter-glow newsletter-glow-1"></div>
    <div class="newsletter-glow newsletter-glow-2"></div>
    <div class="container-max">
        <div class="newsletter-content">
            <div class="newsletter-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
            </div>
            <h2 class="newsletter-title">Get 15% Off Your First Order</h2>
            <p class="newsletter-subtitle">Join our VIP list for exclusive deals, hair care tips, and early access to new products</p>

            <form class="newsletter-form" action="#" method="post">
                <input type="email" name="email" placeholder="Enter your email address" required />
                <button type="submit">Get My Discount</button>
            </form>

            <p class="newsletter-privacy">We respect your privacy. Unsubscribe at any time.</p>

            <div class="newsletter-benefits">
                <div class="benefit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"></path></svg><span>Exclusive Deals</span></div>
                <div class="benefit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg><span>Hair Care Tips</span></div>
                <div class="benefit"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg><span>Early Access</span></div>
            </div>
        </div>
    </div>
</section>

<!-- PRODUCT CARD STYLES (Inline to prevent flashing) -->
<style>
/* Product Grid */
.products-grid.home-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
}
@media (max-width: 1200px) { .products-grid.home-grid { grid-template-columns: repeat(3, 1fr); } }
@media (max-width: 900px) { .products-grid.home-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .products-grid.home-grid { grid-template-columns: 1fr; } }

/* Product Card - Fixed styling (no flashing) */
.product-card {
    background: #fff;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
    border: 1px solid #EAE3D9;
    position: relative;
}
.product-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 20px 40px rgba(183,110,121,0.2);
}
.product-card::before {
    content: '';
    position: absolute;
    inset: -2px;
    background: linear-gradient(135deg, #B76E79, #D4A574);
    border-radius: 1.1rem;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: -1;
}
.product-card:hover::before { opacity: 1; }

.product-card-link {
    text-decoration: none;
    color: inherit;
    display: block;
}
.product-card-glow { display: none; }

.product-image-wrap {
    position: relative;
    aspect-ratio: 3/4;
    overflow: hidden;
    background: #f5f5f5;
}
.product-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
}
.product-card:hover .product-image { transform: scale(1.1); }

.product-badge {
    position: absolute;
    top: 1rem;
    left: 1rem;
    background: #B76E79;
    color: white;
    padding: 0.375rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    z-index: 2;
}

.product-quick-actions {
    position: absolute;
    top: 1rem;
    right: 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    opacity: 0;
    transform: translateX(10px);
    transition: all 0.3s ease;
    z-index: 2;
}
.product-card:hover .product-quick-actions {
    opacity: 1;
    transform: translateX(0);
}
.quick-action-btn {
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
    transition: all 0.2s ease;
}
.quick-action-btn:hover { background: #B76E79; color: white; }
.quick-action-btn svg { width: 18px; height: 18px; }

.product-info { padding: 1.25rem; }
.product-category {
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #B76E79;
    font-weight: 600;
    display: block;
    margin-bottom: 0.5rem;
}
.product-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: #2B2B2B;
    margin-bottom: 0.75rem;
    line-height: 1.3;
}

.price-box {
    background: #FAF5EE;
    padding: 0.75rem;
    border-radius: 0.5rem;
    margin-bottom: 0.75rem;
}
.price-label {
    font-size: 0.75rem;
    color: #6B6B6B;
    margin-bottom: 0.25rem;
}
.price-value {
    font-size: 1.25rem;
    font-weight: 700;
    color: #B76E79;
}

.product-meta {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: #6B6B6B;
}
.in-stock { color: #22c55e; }
.free-shipping { color: #6B6B6B; }

.product-card-cta { padding: 0 1.25rem 1.25rem; }
.select-options-btn {
    display: block;
    width: 100%;
    text-align: center;
    padding: 0.875rem 1.5rem;
    background: linear-gradient(135deg, #B76E79, #9B5A63);
    color: white;
    font-weight: 600;
    border-radius: 9999px;
    text-decoration: none;
    transition: all 0.3s ease;
}
.select-options-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 25px rgba(183,110,121,0.3);
}

.section-cta { text-align: center; margin-top: 3rem; }
.no-products { grid-column: 1 / -1; text-align: center; padding: 3rem; color: #6B6B6B; }

/* Lucy Gallery Section */
.lucy-gallery-section { background: linear-gradient(to bottom, #FAF5EE, #fff); padding: 5rem 0; }
.gallery-badge { display: inline-flex; align-items: center; gap: 0.75rem; padding: 0.75rem 1.5rem; border-radius: 9999px; background: linear-gradient(135deg, rgba(183,110,121,0.1), rgba(155,90,99,0.1)); border: 2px solid rgba(183,110,121,0.2); margin-bottom: 1.5rem; }
.gallery-badge svg { width: 1.25rem; height: 1.25rem; color: #B76E79; }
.gallery-badge span { font-weight: 700; color: #B76E79; text-transform: uppercase; letter-spacing: 0.05em; font-size: 0.875rem; }
.gallery-title { font-size: 2.5rem; font-weight: 700; color: #2B2B2B; margin-bottom: 1rem; }
.gallery-title .gradient-text { background: linear-gradient(135deg, #B76E79, #D4A574); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
.gallery-subtitle { font-size: 1.125rem; color: #6B6B6B; max-width: 42rem; margin: 0 auto 1.5rem; }
.instagram-handle { display: inline-flex; align-items: center; gap: 0.5rem; color: #B76E79; font-weight: 600; text-decoration: none; transition: gap 0.3s ease; }
.instagram-handle:hover { gap: 0.75rem; }
.instagram-handle svg { width: 1.25rem; height: 1.25rem; }
.lucy-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2rem; }
@media (max-width: 900px) { .lucy-grid { grid-template-columns: repeat(2, 1fr); } }
.lucy-item { position: relative; aspect-ratio: 1; border-radius: 1rem; overflow: hidden; cursor: pointer; transition: transform 0.5s ease; }
.lucy-item:hover { transform: scale(1.05); z-index: 10; }
.lucy-item img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.7s ease; }
.lucy-item:hover img { transform: scale(1.1); }
.lucy-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), transparent); opacity: 0; transition: opacity 0.3s ease; display: flex; align-items: center; justify-content: center; }
.lucy-item:hover .lucy-overlay { opacity: 1; }
.lucy-stats { display: flex; gap: 1.5rem; color: white; }
.lucy-stats span { display: flex; align-items: center; gap: 0.5rem; font-weight: 700; font-size: 1.125rem; }
.lucy-stats svg { width: 1.5rem; height: 1.5rem; }
.lucy-ig-badge { position: absolute; top: 0.75rem; right: 0.75rem; width: 2.5rem; height: 2.5rem; border-radius: 50%; background: rgba(255,255,255,0.2); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.3s ease; }
.lucy-item:hover .lucy-ig-badge { opacity: 1; }
.lucy-ig-badge svg { width: 1.25rem; height: 1.25rem; color: white; }
.btn-instagram { display: inline-flex; align-items: center; gap: 0.75rem; padding: 1rem 2rem; border-radius: 9999px; background: linear-gradient(135deg, #E1306C, #833AB4); color: white; font-weight: 700; font-size: 1.125rem; text-decoration: none; box-shadow: 0 10px 40px rgba(225,48,108,0.3); transition: all 0.3s ease; }
.btn-instagram:hover { transform: scale(1.05); box-shadow: 0 15px 50px rgba(225,48,108,0.4); }
.btn-instagram svg { width: 1.5rem; height: 1.5rem; }

/* Features Section */
.features-section { background: #fff; padding: 5rem 0; }
.features-title { font-size: 2.5rem; font-weight: 700; color: #2B2B2B; margin-bottom: 1rem; }
.features-subtitle { font-size: 1.25rem; color: #6B6B6B; max-width: 42rem; margin: 0 auto; }
.features-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; margin-top: 3rem; }
@media (max-width: 1024px) { .features-grid { grid-template-columns: repeat(2, 1fr); } }
@media (max-width: 600px) { .features-grid { grid-template-columns: 1fr; } }
.feature-card { padding: 2rem; background: #FAF5EE; border-radius: 1rem; transition: all 0.3s ease; }
.feature-card:hover { background: #F4E4E6; transform: translateY(-0.5rem); box-shadow: 0 20px 40px rgba(0,0,0,0.1); }
.feature-icon { color: #B76E79; margin-bottom: 1rem; transition: transform 0.3s ease; }
.feature-card:hover .feature-icon { transform: scale(1.1); }
.feature-icon svg { width: 3rem; height: 3rem; }
.feature-card h3 { font-size: 1.25rem; font-weight: 700; color: #2B2B2B; margin-bottom: 0.75rem; }
.feature-card p { color: #6B6B6B; line-height: 1.6; }

/* Testimonials Section */
.testimonials-section { background: linear-gradient(135deg, #F4E4E6, #FAF8F5); padding: 5rem 0; }
.testimonials-title { font-size: 2.5rem; font-weight: 700; color: #2B2B2B; margin-bottom: 1rem; }
.testimonials-subtitle { font-size: 1.25rem; color: #6B6B6B; }
.testimonials-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 3rem; }
@media (max-width: 900px) { .testimonials-grid { grid-template-columns: 1fr; } }
.testimonial-card { background: white; border-radius: 1.5rem; padding: 2rem; box-shadow: 0 10px 40px rgba(0,0,0,0.08); }
.testimonial-stars { display: flex; gap: 0.25rem; margin-bottom: 1rem; }
.testimonial-stars svg { width: 1.25rem; height: 1.25rem; color: #D4AF37; }
.testimonial-text { font-size: 1.125rem; color: #2B2B2B; line-height: 1.7; font-style: italic; margin-bottom: 1.5rem; }
.testimonial-author { display: flex; align-items: center; gap: 1rem; }
.testimonial-author img { width: 3.5rem; height: 3.5rem; border-radius: 50%; object-fit: cover; border: 3px solid #B76E79; }
.testimonial-author strong { display: block; color: #2B2B2B; font-weight: 700; }
.testimonial-author span { color: #6B6B6B; font-size: 0.875rem; }
.trust-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 2rem; margin-top: 4rem; max-width: 56rem; margin-left: auto; margin-right: auto; }
@media (max-width: 768px) { .trust-stats { grid-template-columns: repeat(2, 1fr); } }
.trust-stat { text-align: center; }
.stat-value { font-size: 2.5rem; font-weight: 700; color: #B76E79; margin-bottom: 0.5rem; }
.stat-label { font-size: 0.875rem; color: #6B6B6B; }

/* Newsletter Section */
.newsletter-section { background: linear-gradient(135deg, #B76E79, #A05D68); padding: 5rem 0; position: relative; overflow: hidden; }
.newsletter-glow { position: absolute; width: 24rem; height: 24rem; background: rgba(255,255,255,0.1); border-radius: 50%; filter: blur(60px); }
.newsletter-glow-1 { top: 0; right: 0; }
.newsletter-glow-2 { bottom: 0; left: 0; }
.newsletter-content { position: relative; z-index: 10; max-width: 48rem; margin: 0 auto; text-align: center; }
.newsletter-icon { margin-bottom: 2rem; }
.newsletter-icon svg { width: 4rem; height: 4rem; color: white; margin: 0 auto; }
.newsletter-title { font-size: 2.5rem; font-weight: 700; color: white; margin-bottom: 1rem; }
.newsletter-subtitle { font-size: 1.25rem; color: rgba(255,255,255,0.9); margin-bottom: 2rem; }
.newsletter-form { display: flex; flex-direction: column; gap: 1rem; max-width: 32rem; margin: 0 auto; }
@media (min-width: 640px) { .newsletter-form { flex-direction: row; } }
.newsletter-form input { flex: 1; padding: 1rem 1.5rem; border-radius: 9999px; border: none; font-size: 1rem; color: #2B2B2B; }
.newsletter-form input::placeholder { color: #6B6B6B; }
.newsletter-form input:focus { outline: none; box-shadow: 0 0 0 4px rgba(255,255,255,0.3); }
.newsletter-form button { padding: 1rem 2rem; background: white; color: #B76E79; font-weight: 600; border-radius: 9999px; border: none; cursor: pointer; transition: all 0.3s ease; white-space: nowrap; }
.newsletter-form button:hover { background: #FAF8F5; transform: translateY(-2px); box-shadow: 0 10px 30px rgba(0,0,0,0.2); }
.newsletter-privacy { font-size: 0.875rem; color: rgba(255,255,255,0.7); margin-top: 1.5rem; }
.newsletter-benefits { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; margin-top: 3rem; }
@media (max-width: 640px) { .newsletter-benefits { grid-template-columns: 1fr; } }
.benefit { display: flex; align-items: center; justify-content: center; gap: 0.75rem; color: white; }
.benefit svg { width: 1.5rem; height: 1.5rem; }
.benefit span { font-weight: 600; }

.text-center { text-align: center; }
.mb-12 { margin-bottom: 3rem; }
.mt-8 { margin-top: 2rem; }
</style>

<?php get_footer(); ?>
