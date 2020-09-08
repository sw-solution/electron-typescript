/**
 * Base webpack config used across other specific configs
 */

import path from 'path';
import webpack from 'webpack';
import dotenv from 'dotenv';
import { dependencies as externals } from '../app/package.json';

dotenv.config();

export default {
  externals: [
    ...Object.keys(externals || {}).filter((x) => x !== 'react-map-gl'),
  ],

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
    ],
  },

  output: {
    path: path.join(__dirname, '..', 'app'),
    // https://github.com/webpack/webpack/issues/1114
    libraryTarget: 'commonjs2',
  },

  /**
   * Determine the array of extensions that should be used to resolve modules.
   */
  resolve: {
    extensions: ['.js', '.jsx', '.json', '.ts', '.tsx'],
    modules: [path.join(__dirname, '..', 'app'), 'node_modules'],
  },

  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production',
      MAPBOX_TOKEN: process.env.MAPBOX_TOKEN,
      MTP_WEB_AUTH_URL: process.env.MTP_WEB_AUTH_URL,
      MTP_WEB_APP_ID: process.env.MTP_WEB_APP_ID,
      MTP_WEB_APP_SECRET: process.env.MTP_WEB_APP_SECRET,
      MAPILLARY_APP_ID: process.env.MAPILLARY_APP_ID,
      MAPILLARY_REDIRECT_URI: process.env.MAPILLARY_REDIRECT_URI,
      NODE_OPTIONS: '--max-old-space-size=8192',
    }),

    new webpack.NamedModulesPlugin(),

    new webpack.DefinePlugin({
      'process.env.FLUENTFFMPEG_COV': false,
    }),
    new webpack.IgnorePlugin(/vertx/),
  ],
};
