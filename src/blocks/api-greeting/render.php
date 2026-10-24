<?php
/**
 * Render API Greeting block.
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

$name = $attributes['name'] ?? 'Gościu';

if ( ! is_string( $name ) ) {
    $name = 'Gościu';
}
?>

<div <?php echo get_block_wrapper_attributes(); ?>>
    <h3><?php echo esc_html__( 'API Greeting', 'fse-theme' ); ?></h3>
    <p>
        <?php echo esc_html( 'Cześć, ' . $name . '!' ); ?>
    </p>
</div>