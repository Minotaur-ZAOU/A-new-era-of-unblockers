import React, { useState } from 'react';

// シーザー暗号の関数
const caesarCipher = (str, shift) => {
  return str.split('').map(char => {
    if (char.match(/[a-z]/i)) {
      let code = char.charCodeAt();
      // 大文字
      if (code >= 65 && code <= 90) {
        return String.fromCharCode(((code - 65 + shift) % 26) + 65);
      }
      // 小文字
      if (code >= 97 && code <= 122) {
        return String.fromCharCode(((code - 97 + shift) % 26) + 97);
      }
    }
    return char; // 非アルファベットはそのまま返す
  }).join('');
};

const SearchBar = () => {
  const [url, setUrl] = useState('');
  const [encryptedUrl, setEncryptedUrl] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    // URLを暗号化
    const encrypted = caesarCipher(url, 3); // シフト値は3
    setEncryptedUrl(encrypted);
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="URLを入力"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ width: '400px', padding: '10px', fontSize: '16px' }}
        />
        <button type="submit">暗号化</button>
      </form>
      {encryptedUrl && (
        <div>
          <h3>暗号化されたURL:</h3>
          <p>{encryptedUrl}</p>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
