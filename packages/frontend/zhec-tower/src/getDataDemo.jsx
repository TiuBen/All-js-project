import React, { useState, useEffect } from 'react';

function DataFetchingComponent() {
  // 定义状态来存储数据和加载状态
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 使用 useEffect 来处理数据获取
  useEffect(() => {
    // 定义获取数据的函数
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch('https://api.example.com/data'); // 替换为实际的 API 网址
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const result = await response.json();
        setData(result); // 更新数据状态
      } catch (error) {
        setError(error.message); // 处理错误
      } finally {
        setLoading(false); // 结束加载状态
      }
    };

    // 调用获取数据的函数
    fetchData();

    // 可选：设置定时器定期重新加载数据（可根据需要调整）
    const intervalId = setInterval(fetchData, 60000); // 每 60 秒重新加载

    // 清理定时器（当组件卸载时）
    return () => clearInterval(intervalId);

  }, []); // 空依赖数组，确保只在组件挂载时执行一次

  // 根据状态渲染内容
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>No data available</p>;

  return (
    <div>
      <h1>Data:</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default DataFetchingComponent;
