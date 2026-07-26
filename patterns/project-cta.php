<?php
/**
 * Title: CTA projektu
 * Slug: fse-theme/project-cta
 * Categories: call-to-action, featured
 * Description: Sekcja zachęcająca do obejrzenia repozytorium projektu.
 * Inserter: true
 *
 * @package FSE_Theme
 */
?>

<!-- wp:group {"tagName":"section","align":"full","className":"project-cta","layout":{"type":"constrained"}} -->
<section class="wp-block-group alignfull project-cta">

	<!-- wp:group {"align":"wide","className":"project-cta__inner","layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
	<div class="wp-block-group alignwide project-cta__inner">

		<!-- wp:group {"className":"project-cta__content","layout":{"type":"constrained","justifyContent":"left"}} -->
		<div class="wp-block-group project-cta__content">

			<!-- wp:paragraph {"className":"project-cta__eyebrow"} -->
			<p class="project-cta__eyebrow">
				Projekt na GitHubie
			</p>
			<!-- /wp:paragraph -->

			<!-- wp:heading {"level":2,"className":"project-cta__title"} -->
			<h2 class="wp-block-heading project-cta__title">
				Zobacz, jak powstaje profesjonalny motyw FSE
			</h2>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"className":"project-cta__description"} -->
			<p class="project-cta__description">
				Repozytorium pokazuje strukturę motywu blokowego, własne wzorce,
				szablony oraz konfigurację opartą na theme.json.
			</p>
			<!-- /wp:paragraph -->

		</div>
		<!-- /wp:group -->

		<!-- wp:buttons {"className":"project-cta__actions","layout":{"type":"flex","flexWrap":"wrap"}} -->
		<div class="wp-block-buttons project-cta__actions">

			<!-- wp:button {"className":"project-cta__button"} -->
			<div class="wp-block-button project-cta__button">
				<a
					class="wp-block-button__link wp-element-button"
					href="https://github.com/natalkakielbicka-coder/fse-theme"
				>
					Otwórz repozytorium
				</a>
			</div>
			<!-- /wp:button -->

			<!-- wp:button {"className":"is-style-outline project-cta__button-outline"} -->
			<div class="wp-block-button is-style-outline project-cta__button-outline">
				<a
					class="wp-block-button__link wp-element-button"
					href="#najnowsze-wpisy"
				>
					Zobacz wpisy
				</a>
			</div>
			<!-- /wp:button -->

		</div>
		<!-- /wp:buttons -->

	</div>
	<!-- /wp:group -->

</section>
<!-- /wp:group -->