read -s -p "Password: " PASS
read -s -p "New Password: " NEW_PASS

curl -X POST http://127.0.0.1:5984/_cluster_setup \
  -u "admin:$PASS" \
  -H 'Content-Type: application/json' \
  -d '{"action":"enable_single_node","username":"admin","password":"'"$NEW_PASS"'","bind_address":"127.0.0.1","port":5984}'
