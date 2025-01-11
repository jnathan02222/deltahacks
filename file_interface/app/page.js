'use client'
import Image from "next/image";
import {useState, useRef, useEffect} from 'react';

export default function Home() {
  const [file, setFile] = useState("");
  const formRef = useRef(null);
  

  return (
    <main className="flex flex-col  max-h-screen justify-center	items-center p-24">
      <div className="flex items-center">
        <h1 className='select-none	text-7xl text-black font-bold pl-5'>Brain</h1>
        <Image src="/brain.png" width={150} height={150} alt="is brain"></Image>
        <h1 className='select-none	text-7xl text-black font-bold'>Bullet</h1>
      </div>
      <form className="flex flex-col" action="/notes" method="POST" encType="multipart/form-data">
        <div className="flex flex-col justify-center items-center border-2 border-grey-500 border-dashed	 w-128 rounded-md	w-96 mt-8 h-96 bg-gray-100">
          <label htmlFor="notes" className="bg-indigo-300 flex text-black  drop-shadow-[0_0_35px_rgba(147,188,245,0.75)] rounded-md p-3  cursor-pointer ">
            <svg data-v-6b709297="" xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path data-v-6b709297="" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline data-v-6b709297="" points="14 2 14 8 20 8"></polyline><line data-v-6b709297="" x1="12" y1="18" x2="12" y2="12"></line><line data-v-6b709297="" x1="9" y1="15" x2="15" y2="15"></line></svg>
            <p className="pl-2">Choose File</p>
          </label>
          <p className="pt-2">{file}</p>
          <input onChange={()=>{setFile(formRef.current.files[0].name)}} ref={formRef} type="file" id="notes" name="note" className="w-[100px] hidden"/>
        </div>
        <div className="flex justify-center">

          <button className="p-2 m-2 border-black border-2 rounded-md flex items-center">
            <Image src="/upload.png" width={20} height={20} alt="is upload" ></Image>
            
            <p className="pl-2">Upload Notes</p>
          </button>
        </div>
      </form>
      
    </main>
  );
}
