set -e
cd '/mnt/c/Users/beyza/Desktop/38331~1.SNF/webProgramming/ALUMNI~1'
docker compose run --rm -e APP_ENV=testing app php artisan test --filter=CrudTest
docker compose exec -T mysql mysql -uroot -proot_secret alumni -e "SELECT COUNT(*) AS users_after_test FROM users; SELECT COUNT(*) AS announcements_after_test FROM announcements;"
