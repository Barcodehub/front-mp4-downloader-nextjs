'use client'
import { useState } from 'react';
import axios from 'axios';
import toast, { Toaster } from 'react-hot-toast';

export default function Home() {
  const [url, setUrl] = useState('');
  const [quality, setQuality] = useState('best');
  const [type, setType] = useState('video');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
  
    try {
      const response = await axios.post(`http://localhost:3001/api/download`, {
        url,
        quality,
        type
      }, {
        responseType: 'blob'
      });
  
      // Obtener el tipo de contenido de la respuesta
      const contentType = response.headers['content-type'];
      
      // Obtener el nombre del archivo de la cabecera Content-Disposition
      const contentDisposition = response.headers['content-disposition'];
      console.log('Received content type:', contentType);
      let filename = 'download';
      if (contentDisposition) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(contentDisposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, '');
        }
      }
  
      // Crear el objeto Blob con el tipo de contenido correcto
      const blob = new Blob([response.data], { type: contentType });
      
      // Crear una URL para el blob
      const downloadUrl = window.URL.createObjectURL(blob);
      
      // Crear un enlace temporal y hacer clic en él para descargar
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      // Liberar la URL del objeto
      window.URL.revokeObjectURL(downloadUrl);
  
      toast.success('Download successful!');
    } catch (error) {
      console.error('Download failed:', error);
      toast.error('Download failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <Toaster />
      <h1 className="text-4xl font-bold mb-8">YouTube Downloader</h1>
      <form onSubmit={handleSubmit} className="w-full max-w-md">
        <div className="mb-4">
          <label htmlFor="url" className="block text-sm font-medium text-gray-700">
            YouTube URL
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>
        <div className="mb-4">
          <label htmlFor="quality" className="block text-sm font-medium text-gray-700">
            Quality
          </label>
          <select
            id="quality"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="best">Best</option>
            <option value="hd">HD</option>
          </select>
        </div>
        <div className="mb-4">
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
          >
            <option value="video">Single Video</option>
            <option value="playlist">Playlist</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          {isLoading ? 'Downloading...' : 'Download'}
        </button>
      </form>
    </main>
  );
}