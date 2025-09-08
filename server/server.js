const express = require('express');
const cors = require('cors');
const path = require('path');
const oracledb = require('oracledb');

const app = express();
app.use(cors());

// ejs 설정
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '.')); // .은 경로

const config = {
  user: 'SYSTEM',
  password: 'test1234',
  connectString: 'localhost:1521/xe'
};

// Oracle 데이터베이스와 연결을 유지하기 위한 전역 변수
let connection;

// 데이터베이스 연결 설정
async function initializeDatabase() {
  try {
    connection = await oracledb.getConnection(config);
    console.log('Successfully connected to Oracle database');
  } catch (err) {
    console.error('Error connecting to Oracle database', err);
  }
}

initializeDatabase();

// 엔드포인트
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.get('/emp/list', async (req, res) => {
  const { } = req.query;
  try {
    let query1 = `SELECT * FROM EMP`;
    let query2 = `SELECT EMPNO, ENAME, JOB, SAL, D.DEPTNO, D.DNAME FROM EMP E `
      + `INNER JOIN DEPT D ON E.DEPTNO = D.DEPTNO `
      + `ORDER BY SAL DESC`;

    // 백틱으로 작성할 필요 있음(변수값을 직접 입력하는 경우를 대비함)
    const result = await connection.execute(query2);
    const columnNames = result.metaData.map(column => column.name);
    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    res.json({
      result: "success",
      empList: rows
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});


app.get('/prof/list', async (req, res) => {
  const { } = req.query;
  try {
    let query1 = `SELECT * FROM PROFESSOR`;
    // let query2 = `SELECT EMPNO, ENAME, JOB, SAL, D.DEPTNO, D.DNAME FROM EMP E `
    //   + `INNER JOIN DEPT D ON E.DEPTNO = D.DEPTNO `
    //   + `ORDER BY SAL DESC`;

    // 백틱으로 작성할 필요 있음(변수값을 직접 입력하는 경우를 대비함)
    const result = await connection.execute(query1);
    const columnNames = result.metaData.map(column => column.name);
    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    res.json({
      result: "success",
      profList: rows
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});


app.get('/emp/delete', async (req, res) => {
  const { empNo } = req.query;

  try {
    await connection.execute(
      // DELETE FROM EMP WHERE EMPNO = `${empNo}`,
      `DELETE FROM EMP WHERE EMPNO = :empNo`,
      [empNo],
      { autoCommit: true }
    );
    res.json({
      result: "success"
    });
  } catch (error) {
    console.error('Error executing delete', error);
    res.status(500).send('Error executing insert');
  }
});


app.get('/prof/delete', async (req, res) => {
  const { profNo } = req.query;

  try {
    await connection.execute(
      // DELETE FROM PROFESSOR WHERE PROFNO = `${profNo}`,
      `DELETE FROM PROFESSOR WHERE PROFNO = :profNo`,
      [profNo],
      { autoCommit: true }
    );
    res.json({
      result: "success"
    });
  } catch (error) {
    console.error('Error executing delete', error);
    res.status(500).send('Error executing insert');
  }
});


app.get('/emp/insert', async (req, res) => {
  const { empNo, eName, job, sal, selectDept } = req.query;

  try {
    await connection.execute(
      // INSERT INTO EMP() VALUES (`${profNo}`),
      `INSERT INTO EMP(EMPNO, ENAME, JOB, SAL, DEPTNO) VALUES(:empNo, :eName, :job, :sal, :selectDept)`,
      [empNo, eName, job, sal, selectDept],
      { autoCommit: true }
    );
    res.json({
      result: "success"
    });
  } catch (error) {
    console.error('Error executing delete', error);
    res.status(500).send('Error executing insert');
  }
});


app.get('/emp/info', async (req, res) => {
  const { empNo } = req.query;
  try {
    let query1 = `SELECT E.*, EMPNO "empNo", ENAME "eName", JOB "job", SAL "sal", DEPTNO "selectDept" `
      + `FROM EMP E `
      + `WHERE EMPNO = ${empNo}`;

    // 백틱으로 작성할 필요 있음(변수값을 직접 입력하는 경우를 대비함)
    const result = await connection.execute(query1);
    const columnNames = result.metaData.map(column => column.name);
    // 쿼리 결과를 JSON 형태로 변환
    const rows = result.rows.map(row => {
      // 각 행의 데이터를 컬럼명에 맞게 매핑하여 JSON 객체로 변환
      const obj = {};
      columnNames.forEach((columnName, index) => {
        obj[columnName] = row[index];
      });
      return obj;
    });
    res.json({
      result: "success",
      empInfo: rows[0] // PK로 검색된 것이라 하나의 map data만 존재하므로 index=0인 배열
    });
  } catch (error) {
    console.error('Error executing query', error);
    res.status(500).send('Error executing query');
  }
});



// 서버 시작
app.listen(3009, () => {
  console.log('Server is running on port 3009');
});
