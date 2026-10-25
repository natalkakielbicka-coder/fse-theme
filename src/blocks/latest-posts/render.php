
<?php
/**
 * Frontend: FSE Latest Posts.
 */

$posts_to_show = isset( $attributes['postsToShow'] )
    ? max( 1, min( 10, absint( $attributes['postsToShow'] ) ) )
    : 5;

$order_by = $attributes['orderBy'] ?? 'date';
$order    = $attributes['order'] ?? 'desc';
$category = absint( $attributes['categoryId'] ?? 0 );

// Dozwolone wartości sortowania.
if ( ! in_array( $order_by, array( 'date', 'title' ), true ) ) {
    $order_by = 'date';
}

if ( ! in_array( $order, array( 'asc', 'desc' ), true ) ) {
    $order = 'desc';
}

$args = array(
    'post_type'           => 'post',
    'post_status'         => 'publish',
    'posts_per_page'      => $posts_to_show,
    'orderby'             => $order_by,
    'order'               => strtoupper( $order ),
    'ignore_sticky_posts' => true,
    'no_found_rows'       => true,
);

if ( $category > 0 ) {
    $args['category__in'] = array( $category );
}

$query = new WP_Query( $args );
?>

<div <?php echo get_block_wrapper_attributes(); ?>>
    <h3><?php esc_html_e( 'Najnowsze wpisy', 'fse-theme' ); ?></h3>

    <?php if ( $query->have_posts() ) : ?>
        <ul>
            <?php while ( $query->have_posts() ) : $query->the_post(); ?>
                <li>
                    <a href="<?php echo esc_url( get_permalink() ); ?>">
                        <?php echo esc_html( get_the_title() ); ?>
                    </a>
                </li>
            <?php endwhile; ?>
        </ul>

        <?php wp_reset_postdata(); ?>
    <?php else : ?>
        <p>Brak wpisów w wybranej kategorii.</p>
    <?php endif; ?>
</div>
