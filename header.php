<!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?php wp_title('|', true, 'right'); ?><?php bloginfo('name'); ?></title>
    <?php wp_head(); ?>
    <style>
    /* EXACT MATCH TO NEXT.JS HEADER */
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #FAF8F5; color: #2C2C2C; line-height: 1.6; }
    a { text-decoration: none; color: inherit; }
    img { max-width: 100%; height: auto; }

    /* Header - matches Next.js exactly */
    .site-header {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 50;
        background-color: #FAF8F5;
        border-bottom: 1px solid #e5e7eb;
    }
    .header-container {
        max-width: 1280px;
        margin: 0 auto;
        padding: 0 1rem;
    }
    .header-inner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 1rem 0;
    }

    /* Logo */
    .site-logo {
        display: flex;
        align-items: center;
    }
    .site-logo img {
        height: 64px;
        width: auto;
    }
    @media (min-width: 768px) {
        .site-logo img { height: 80px; }
    }

    /* Navigation - matches Next.js exactly */
    .main-nav {
        display: none;
    }
    @media (min-width: 1024px) {
        .main-nav {
            display: flex;
            align-items: center;
            gap: 2rem;
        }
    }
    .main-nav a {
        color: #2C2C2C;
        font-weight: 500;
        font-size: 0.875rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
        transition: color 0.2s ease;
    }
    .main-nav a:hover {
        color: #C9B5A0;
    }

    /* Header Actions */
    .header-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .header-btn {
        padding: 0.5rem;
        color: #2C2C2C;
        background: none;
        border: none;
        cursor: pointer;
        transition: color 0.2s ease;
    }
    .header-btn:hover {
        color: #C9B5A0;
    }
    .header-btn svg {
        width: 24px;
        height: 24px;
    }
    .cart-count {
        position: absolute;
        top: 0;
        right: 0;
        width: 18px;
        height: 18px;
        background: #B76E79;
        color: white;
        font-size: 10px;
        font-weight: 700;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Mobile Menu Toggle */
    .mobile-menu-toggle {
        display: block;
        padding: 0.5rem;
        background: none;
        border: none;
        cursor: pointer;
    }
    @media (min-width: 1024px) {
        .mobile-menu-toggle { display: none; }
    }
    .mobile-menu-toggle svg {
        width: 24px;
        height: 24px;
        color: #2C2C2C;
    }

    /* Mobile Menu */
    .mobile-menu {
        display: none;
        padding-bottom: 1rem;
        border-top: 1px solid #e5e7eb;
        padding-top: 1rem;
    }
    .mobile-menu.active {
        display: block;
    }
    @media (min-width: 1024px) {
        .mobile-menu { display: none !important; }
    }
    .mobile-menu a {
        display: block;
        padding: 0.5rem 0;
        color: #2C2C2C;
        font-weight: 500;
        font-size: 0.875rem;
        letter-spacing: 0.05em;
        text-transform: uppercase;
    }
    .mobile-menu a:hover {
        color: #C9B5A0;
    }
    </style>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>

<header class="site-header">
    <div class="header-container">
        <div class="header-inner">
            <!-- Logo -->
            <a href="<?php echo home_url('/'); ?>" class="site-logo">
                <img src="<?php echo get_template_directory_uri(); ?>/images/glamm-logo.png" alt="Glamm Hair Extensions" />
            </a>

            <!-- Desktop Navigation -->
            <nav class="main-nav">
                <a href="<?php echo home_url('/shop/'); ?>">SHOP</a>
                <a href="<?php echo home_url('/about/'); ?>">ABOUT US</a>
                <a href="<?php echo home_url('/how-to-use/'); ?>">HOW TO USE</a>
                <a href="<?php echo home_url('/faq/'); ?>">FAQ</a>
                <a href="<?php echo home_url('/blog/'); ?>">BLOG</a>
                <a href="<?php echo home_url('/contact/'); ?>">CONTACT</a>
            </nav>

            <!-- Cart & Mobile Menu -->
            <div class="header-actions">
                <a href="<?php echo wc_get_cart_url(); ?>" class="header-btn" aria-label="Shopping Cart" style="position: relative;">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path>
                    </svg>
                    <?php if (WC()->cart && WC()->cart->get_cart_contents_count() > 0): ?>
                    <span class="cart-count"><?php echo WC()->cart->get_cart_contents_count(); ?></span>
                    <?php endif; ?>
                </a>

                <button class="mobile-menu-toggle" onclick="document.getElementById('mobile-menu').classList.toggle('active')" aria-label="Toggle Menu">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                    </svg>
                </button>
            </div>
        </div>

        <!-- Mobile Menu -->
        <nav class="mobile-menu" id="mobile-menu">
            <a href="<?php echo home_url('/shop/'); ?>">SHOP</a>
            <a href="<?php echo home_url('/about/'); ?>">ABOUT US</a>
            <a href="<?php echo home_url('/how-to-use/'); ?>">HOW TO USE</a>
            <a href="<?php echo home_url('/faq/'); ?>">FAQ</a>
            <a href="<?php echo home_url('/blog/'); ?>">BLOG</a>
            <a href="<?php echo home_url('/contact/'); ?>">CONTACT</a>
        </nav>
    </div>
</header>

<!-- Spacer for fixed header -->
<div style="height: 80px;"></div>

<main id="main-content">

