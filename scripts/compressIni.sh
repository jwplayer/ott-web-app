# This script cleans up the ini file to remove comments and whitespace, so it only keeps the actual data
# Remove lines that are solely comments with optional leading whitespace
sed -i -e '/^[[:blank:]]*;/d' "$1"
# Remove any comments that come after values
sed -i -e 's/;.*//' "$1"
# Delete blank lines
sed -i -e '/^$/d' "$1"
# Remove whitespace around the equals signs
sed -i -e 's/[[:blank:]]*=[[:blank:]]/=/' "$1"
