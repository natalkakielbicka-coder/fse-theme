(function (blocks, domReady, i18n) {
	'use strict';

	const {
		getBlockVariations,
		registerBlockVariation,
	} = blocks;

	const { __ } = i18n;

	/**
	 * Check whether a variation has already been registered.
	 *
	 * @param {string} blockName     Core block name.
	 * @param {string} variationName Variation name.
	 *
	 * @return {boolean}
	 */
	function variationExists(blockName, variationName) {
		return getBlockVariations(blockName).some(
			(variation) => variation.name === variationName
		);
	}

	domReady(function () {
		/*
		 * Basic full-width section.
		 */
		if (!variationExists('core/group', 'fse-theme-section')) {
			registerBlockVariation('core/group', {
				name: 'fse-theme-section',
				title: __('Sekcja', 'fse-theme'),
				description: __(
					'Sekcja na pełną szerokość z wewnętrznym kontenerem.',
					'fse-theme'
				),
				icon: 'layout',
				category: 'design',
				keywords: [
					__('sekcja', 'fse-theme'),
					__('kontener', 'fse-theme'),
					__('section', 'fse-theme'),
				],
				attributes: {
					tagName: 'section',
					align: 'full',
					className: 'fse-section',
					layout: {
						type: 'constrained',
					},
					style: {
						spacing: {
							padding: {
								top: 'var:preset|spacing|70',
								bottom: 'var:preset|spacing|70',
							},
						},
					},
				},
				innerBlocks: [
					[
						'core/group',
						{
							align: 'wide',
							className: 'fse-section__inner',
							layout: {
								type: 'constrained',
							},
						},
						[
							[
								'core/heading',
								{
									level: 2,
									placeholder: __(
										'Nagłówek sekcji',
										'fse-theme'
									),
								},
							],
							[
								'core/paragraph',
								{
									placeholder: __(
										'Dodaj treść sekcji…',
										'fse-theme'
									),
								},
							],
						],
					],
				],
				scope: ['inserter'],
				isActive: function (attributes) {
					const classNames = attributes.className || '';

					return classNames
						.split(' ')
						.includes('fse-section');
				},
			});
		}

		/*
		 * Full-width section with two columns.
		 */
		if (
			!variationExists(
				'core/group',
				'fse-theme-section-two-columns'
			)
		) {
			registerBlockVariation('core/group', {
				name: 'fse-theme-section-two-columns',
				title: __('Sekcja z dwiema kolumnami', 'fse-theme'),
				description: __(
					'Sekcja z treścią, przyciskiem i miejscem na obraz.',
					'fse-theme'
				),
				icon: 'columns',
				category: 'design',
				keywords: [
					__('sekcja', 'fse-theme'),
					__('kolumny', 'fse-theme'),
					__('obraz', 'fse-theme'),
				],
				attributes: {
					tagName: 'section',
					align: 'full',
					className:
						'fse-section fse-section--two-columns',
					layout: {
						type: 'constrained',
					},
					style: {
						spacing: {
							padding: {
								top: 'var:preset|spacing|70',
								bottom: 'var:preset|spacing|70',
							},
						},
					},
				},
				innerBlocks: [
					[
						'core/group',
						{
							align: 'wide',
							className: 'fse-section__inner',
							layout: {
								type: 'constrained',
							},
						},
						[
							[
								'core/columns',
								{
									verticalAlignment: 'center',
									className: 'fse-section__columns',
									style: {
										spacing: {
											blockGap: {
												left: 'var:preset|spacing|60',
											},
										},
									},
								},
								[
									[
										'core/column',
										{
											verticalAlignment:
												'center',
										},
										[
											[
												'core/paragraph',
												{
													className:
														'fse-section__eyebrow',
													placeholder: __(
														'Nadtytuł sekcji',
														'fse-theme'
													),
												},
											],
											[
												'core/heading',
												{
													level: 2,
													placeholder: __(
														'Nagłówek sekcji',
														'fse-theme'
													),
												},
											],
											[
												'core/paragraph',
												{
													placeholder: __(
														'Dodaj opis sekcji…',
														'fse-theme'
													),
												},
											],
											[
												'core/buttons',
												{},
												[
													[
														'core/button',
														{
															text: __(
																'Dowiedz się więcej',
																'fse-theme'
															),
														},
													],
												],
											],
										],
									],
									[
										'core/column',
										{
											verticalAlignment:
												'center',
										},
										[
											[
												'core/image',
												{
													className:
														'fse-section__image',
												},
											],
										],
									],
								],
							],
						],
					],
				],
				scope: ['inserter'],
				isActive: function (attributes) {
					const classNames = attributes.className || '';

					return classNames
						.split(' ')
						.includes('fse-section--two-columns');
				},
			});
		}
	});
})(window.wp.blocks, window.wp.domReady, window.wp.i18n);