# This script cleans up the ini file to remove comments and whitespace, so it only keeps the actual data
# Remove lines that are solely comments with optional leading whitespace
sed '/^[[:blank:]]*;/d' "$1" |
# Remove any comments that come after values
sed 's/;.*//' |
# Delete blank lines
sed '/^$/d' |
# Remove whitespace around the equals signs
sed 's/[[:blank:]]*=[[:blank:]]/=/' > "$1.tmp.ini"
# The output is piped to a temp file because the -i flag on sed to do inplace varies by OS
# so copy the temp file back to the original file at the end.
mv "$1.tmp.ini" "$1"
