const express = require('express');
const multer = require('multer');
const oracledb = require('oracledb');
const router = express.Router();
const path = require('path');
router.use(multer());

// 업로드 경로 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Oracle DB 연결 설정

router.set('view engine', 'ejs');
router.set('views', path.join(__dirname, '.')); // .은 경로

const dbConfig = {
  user: 'SYSTEM',
  password: 'test1234',
  connectString: 'localhost:1521/xe'
};

let conn;

async function initializeDatabase() {
  try {
    conn = await oracledb.getConnection(dbConfig);
    console.log('Successfully connected to Oracle database');
  } catch (err) {
    console.error('Error connecting to Oracle database', err);
  }
}

initializeDatabase();


// 엔드포인트
router.post('/', (req, res) => {
  res.send('Hello World');
});



// 제품 등록 API
router.post('/product/add', async (req, res) => {
  const { productName, description, price, stock, category } = req.body;

  try {
    conn = await oracledb.getConnection(dbConfig);

    const result = await conn.execute(
      `
            INSERT INTO TBL_PRODUCT (
                PRODUCT_ID, PRODUCT_NAME, DESCRIPTION, PRICE, STOCK, CATEGORY, USE_YN, CREATE_DT, UPDATE_DT
            ) VALUES (
                SEQ_PRODUCT.NEXTVAL, :productName, :description, :price, :stock, :category, 'Y', SYSDATE, SYSDATE
            )
            RETURNING PRODUCT_ID INTO :productId
            `,
      {
        productName,
        description,
        price,
        stock,
        category,
        productId: { type: oracledb.NUMBER, dir: oracledb.BIND_OUT }
      },
      { autoCommit: true }
    );

    const insertedId = result.outBinds.productId[0];
    res.json({
      message: 'success',
      result: { insertId: insertedId }
    });

  } catch (err) {
    console.error(err);
    res.status(500).send("DB Error");
  } finally {
    if (conn) await conn.close();
  }
});

// 파일 업로드 API
router.post('/product/upload', upload.single('file'), async (req, res) => {
  const { productId } = req.body;
  const filename = req.file.filename;
  const destination = req.file.destination;

  try {
    conn = await oracledb.getConnection(dbConfig);

    await conn.execute(
      `
            INSERT INTO TBL_PRODUCT_FILE (
                FILE_ID, PRODUCT_ID, FILE_NAME, FILE_PATH
            ) VALUES (
                SEQ_PRODUCT_FILE.NEXTVAL, :productId, :fileName, :filePath
            )
            `,
      {
        productId: Number(productId),
        fileName: filename,
        filePath: destination
      },
      { autoCommit: true }
    );

    res.json({
      message: 'success'
    });

  } catch (err) {
    console.error('에러 발생!', err);
    res.status(500).send("Server Error");
  } finally {
    if (conn) await conn.close();
  }
});

module.exports = router;

// 서버 시작
router.listen(3009, () => {
  console.log('Server is running on port 3009');
});

