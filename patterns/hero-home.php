<?php
/**
 * Title: Hero strony głównej
 * Slug: fse-theme/hero-home
 * Categories: featured, banner
 * Description: Sekcja hero prezentująca możliwości motywu FSE.
 * Inserter: true
 *
 * @package FSE_Theme
 */
?>

<!-- wp:group {"tagName":"section","align":"full","className":"home-hero","layout":{"type":"constrained"}} -->
<section class="wp-block-group alignfull home-hero">

	<!-- wp:group {"align":"wide","className":"home-hero__inner","layout":{"type":"grid","columnCount":2}} -->
	<div class="wp-block-group alignwide home-hero__inner">

		<!-- wp:group {"className":"home-hero__content","layout":{"type":"constrained"}} -->
		<div class="wp-block-group home-hero__content">

			<!-- wp:paragraph {"className":"home-hero__eyebrow"} -->
			<p class="home-hero__eyebrow">
				WordPress Full Site Editing
			</p>
			<!-- /wp:paragraph -->

			<!-- wp:heading {"level":1,"className":"home-hero__title"} -->
			<h1 class="wp-block-heading home-hero__title">
				Nowoczesny motyw blokowy zbudowany od podstaw
			</h1>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"className":"home-hero__description"} -->
			<p class="home-hero__description">
				Projekt portfolio wykorzystujący theme.json, szablony blokowe,
				wzorce oraz natywne możliwości edytora WordPress.
			</p>
			<!-- /wp:paragraph -->

			<!-- wp:buttons {"className":"home-hero__actions","layout":{"type":"flex","flexWrap":"wrap"}} -->
			<div class="wp-block-buttons home-hero__actions">

				<!-- wp:button -->
				<div class="wp-block-button">
					<a class="wp-block-button__link wp-element-button" href="#najnowsze-wpisy">
						Zobacz najnowsze wpisy
					</a>
				</div>
				<!-- /wp:button -->

				<!-- wp:button {"className":"is-style-outline"} -->
				<div class="wp-block-button is-style-outline">
					<a class="wp-block-button__link wp-element-button" href="https://github.com/natalkakielbicka-coder/fse-theme">
						Zobacz repozytorium
					</a>
				</div>
				<!-- /wp:button -->

			</div>
			<!-- /wp:buttons -->

		</div>
		<!-- /wp:group -->

		<!-- wp:group {"className":"home-hero__panel","layout":{"type":"constrained"}} -->
		<div class="wp-block-group home-hero__panel">

			<!-- wp:paragraph {"className":"home-hero__panel-label"} -->
			<p class="home-hero__panel-label">
				W projekcie
			</p>
			<!-- /wp:paragraph -->

			<!-- wp:heading {"level":2,"className":"home-hero__panel-title"} -->
			<h2 class="wp-block-heading home-hero__panel-title">
				FSE Theme
			</h2>
			<!-- /wp:heading -->

			<!-- wp:list {"className":"home-hero__features"} -->
			<ul class="wp-block-list home-hero__features">
				<li>Theme.json w wersji 3</li>
				<li>Edytowalne szablony i części szablonów</li>
				<li>Własne wzorce blokowe</li>
				<li>Responsywny układ bez page buildera</li>
				<li>Lokalne fonty i kontrolowane presety</li>
			</ul>
			<!-- /wp:list -->

		</div>
		<!-- /wp:group -->

	</div>
	<!-- /wp:group -->

</section>
<!-- /wp:group -->