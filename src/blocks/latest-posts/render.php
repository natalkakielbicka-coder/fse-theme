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

$show_image   = $attributes['showImage'] ?? true;
$show_date    = $attributes['showDate'] ?? true;
$show_excerpt = $attributes['showExcerpt'] ?? true;

$columns = absint( $attributes['columns'] ?? 3 );
$columns = max( 1, min( 4, $columns ) );

$card_layout = $attributes['cardLayout'] ?? 'vertical';

if ( ! in_array( $card_layout, array( 'vertical', 'horizontal' ), true ) ) {
    $card_layout = 'vertical';
}

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
    'no_found_rows'       => false,
);

if ( $category > 0 ) {
    $args['category__in'] = array( $category );
}

$query = new WP_Query( $args );

$enable_load_more = ! empty( $attributes['enableLoadMore'] );

$total_pages = (int) $query->max_num_pages;
$has_more_posts = $enable_load_more && $total_pages > 1;

$load_more_mode = $attributes['loadMoreMode'] ?? 'button';

if ( ! in_array( $load_more_mode, array( 'button', 'auto' ), true ) ) {
    $load_more_mode = 'button';
}
?>

<div <?php echo get_block_wrapper_attributes(); ?>>
    <h3><?php esc_html_e( 'Najnowsze wpisy', 'fse-theme' ); ?></h3>

    <?php if ( $query->have_posts() ) : ?>
        <div
            class="fse-latest-posts__grid"
            style="<?php echo esc_attr( '--fse-columns: ' . $columns . ';' ); ?>"
        >
            <?php while ( $query->have_posts() ) : $query->the_post(); ?>
            <div class="fse-latest-posts__item">
                <article class="<?php echo esc_attr( 'fse-latest-posts__card fse-latest-posts__card--' . $card_layout ); ?>">

                    <?php if ( $show_image && has_post_thumbnail() ) : ?>
                        <a
                            class="fse-latest-posts__image"
                            href="<?php echo esc_url( get_permalink() ); ?>"
                            tabindex="-1"
                            aria-hidden="true"
                        >
                            <?php the_post_thumbnail( 'medium_large' ); ?>
                        </a>
                    <?php endif; ?>

                    <div class="fse-latest-posts__content">
                        <div class="fse-latest-posts__meta">
                            <?php
                            $categories = get_the_category();

                            if ( ! empty( $categories ) ) :
                                $first_category = $categories[0];
                                ?>
                                <span class="fse-latest-posts__category">
                                    <?php echo esc_html( $first_category->name ); ?>
                                </span>
                            <?php endif; ?>

                            <?php if ( $show_date ) : ?>
                                <time
                                    class="fse-latest-posts__date"
                                    datetime="<?php echo esc_attr( get_the_date( 'c' ) ); ?>"
                                >
                                    <?php echo esc_html( get_the_date() ); ?>
                                </time>
                            <?php endif; ?>
                        </div>

                        <h3 class="fse-latest-posts__title">
                            <a href="<?php echo esc_url( get_permalink() ); ?>">
                                <?php echo esc_html( get_the_title() ); ?>
                            </a>
                        </h3>

                        <?php if ( $show_excerpt ) : ?>
                            <div class="fse-latest-posts__excerpt">
                                <?php
                                echo esc_html(
                                    wp_trim_words(
                                        get_the_excerpt(),
                                        20,
                                        '…'
                                    )
                                );
                                ?>
                            </div>
                        <?php endif; ?>

                        <a
                            class="fse-latest-posts__more"
                            href="<?php echo esc_url( get_permalink() ); ?>"
                        >
                            Czytaj więcej →
                        </a>

                    </div>
                </article>
            </div>
            <?php endwhile; ?>
        </div>
        
        <?php if ( $has_more_posts ) : ?>
            <div
                class="fse-latest-posts__pagination"
                data-api-url="<?php echo esc_url( rest_url( 'wp/v2/posts' ) ); ?>"
                data-page="1"
                data-total-pages="<?php echo esc_attr( $total_pages ); ?>"
                data-per-page="<?php echo esc_attr( $posts_to_show ); ?>"
                data-category="<?php echo esc_attr( $category ); ?>"
                data-order-by="<?php echo esc_attr( $order_by ); ?>"
                data-order="<?php echo esc_attr( $order ); ?>"
                data-card-layout="<?php echo esc_attr( $card_layout ); ?>"
                data-show-image="<?php echo $show_image ? '1' : '0'; ?>"
                data-show-date="<?php echo $show_date ? '1' : '0'; ?>"
                data-show-excerpt="<?php echo $show_excerpt ? '1' : '0'; ?>"
                data-load-mode="<?php echo esc_attr( $load_more_mode ); ?>"
            >
                
                <?php if ( 'auto' === $load_more_mode ) : ?>
                    <button
                        type="button"
                        class="fse-latest-posts__pause-auto"
                        aria-pressed="false"
                    >
                        Zatrzymaj automatyczne ładowanie
                    </button>
                <?php endif; ?>

                <button
                    type="button"
                    class="fse-latest-posts__load-more"
                >
                    Załaduj więcej
                </button>

                <?php if ( 'auto' === $load_more_mode ) : ?>
                    <div
                        class="fse-latest-posts__sentinel"
                        aria-hidden="true"
                    ></div>
                <?php endif; ?>

                <p
                    class="fse-latest-posts__status"
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
                ></p>
            </div>
        <?php endif; ?>

        <?php wp_reset_postdata(); ?>
    <?php else : ?>
        <p>Brak wpisów w wybranej kategorii.</p>
    <?php endif; ?>
</div>
