# This script cleans up the ini file to remove comments and whitespace, so it only keeps the actual data
# Remove lines that are solely comments with optional leading whitespace
sed --in-place='' '/^[[:blank:]]*;/d' "$1"
# Remove any comments that come after values
sed --in-place='' 's/;.*//' "$1"
# Delete blank lines
sed --in-place='' '/^$/d' "$1"
# Remove whitespace around the equals signs
sed --in-place='' 's/[[:blank:]]*=[[:blank:]]/=/' "$1"
