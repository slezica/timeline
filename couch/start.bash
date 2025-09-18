set -e

sed "s#\./couch#$(pwd)/couch#g" couch/couch.ini > couch/couch.absolute.ini

couchdb -couch_ini "$(pwd)/couch/couch.absolute.ini"

