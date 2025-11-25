# Cách chạy backend
Yêu cầu:
docker, docker-compose
nodejs

> Lưu ý: Trước khi tiếp tục cần đảm bảo `.env` được thiết lập trong `backend/`

- Chạy hardhat, build và deploy contract
```sh
cd smart-contract
npm install
npm run dev # chạy hardhat
# Ở một terminal khác cũng trong thư mục smart-contract
npm run deploy # build và deploy contract
```

- Chạy backend và database
```sh
cd backend
npm install
docker compose up -d
npm run dev
```

- Chạy frontend
```sh
cd frontend
npm install
npm run start
```
