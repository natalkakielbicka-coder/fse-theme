<?php
/**
 * Theme functions.
 *
 * @package FSE_Theme
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Load the main theme stylesheet on the front end.
 */
function fse_theme_enqueue_styles(): void {
	$stylesheet_path = get_theme_file_path( 'style.css' );

	$version = file_exists( $stylesheet_path )
		? (string) filemtime( $stylesheet_path )
		: wp_get_theme()->get( 'Version' );

	wp_enqueue_style(
		'fse-theme-style',
		get_stylesheet_uri(),
		array(),
		$version
	);
}
add_action( 'wp_enqueue_scripts', 'fse_theme_enqueue_styles' );

/**
 * Load the main stylesheet inside the Site Editor.
 */
function fse_theme_setup(): void {
	add_editor_style( 'style.css' );
}
add_action( 'after_setup_theme', 'fse_theme_setup' );

/**
 * Register custom styles for core blocks.
 */
function fse_theme_register_block_styles(): void {
	register_block_style(
		'core/group',
		array(
			'name'  => 'fse-card',
			'label' => __( 'Karta', 'fse-theme' ),
		)
	);

	register_block_style(
		'core/button',
		array(
			'name'  => 'fse-arrow',
			'label' => __( 'Ze strzałką', 'fse-theme' ),
		)
	);
}
add_action( 'init', 'fse_theme_register_block_styles' );