/**
 * @see https://github.com/WordPress/gutenberg/blob/master/packages/scripts/config/webpack.config.js
 */
const config = require('@wordpress/scripts/config/webpack.config')

const isProduction = process.env.NODE_ENV === 'production'

module.exports = {
	...config,
	...(!isProduction ? {
		devServer: {
			...config.devServer,
			/** Fix `[webpack-dev-server] Invalid Host/Origin header` error with `wp-scripts start --hot` */
			allowedHosts: 'all',
		},
	} : {}),
}
