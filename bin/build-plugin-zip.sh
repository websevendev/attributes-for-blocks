#!/bin/bash

set -e # Exit if any command fails

rm -f attributes-for-blocks.zip

zip -r attributes-for-blocks.zip \
	index.php \
	attributes-for-blocks.php \
	readme.txt \
	build/* \
	includes/* \
	--exclude="src/test/*"

unzip attributes-for-blocks.zip -d attributes-for-blocks
rm attributes-for-blocks.zip
zip -r attributes-for-blocks.zip attributes-for-blocks
rm -rf ./attributes-for-blocks
