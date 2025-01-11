import Image from "next/image";
export default function Home() {
  return (
    <main className="flex flex-col  min-h-screen justify-center	items-center p-24">
      <h1 className='select-none	text-7xl text-white font-bold drop-shadow-[0_0_35px_rgba(52,235,195,0.75)]'>Brain Bullet</h1>
      <h2 className='select-none	text-xl text-white drop-shadow-[0_0_35px_rgba(52,235,195,0.75)] pt-5'>Drag and Drop a PDF of your notes!</h2>
      <form className="flex justify-center border-2 border-white w-128 rounded-md	w-96 p-10 mt-5">
        <input type="file" id="avatar" name="avatar" accept="image/png" className="w-[100px]"/>
      </form>
      
    </main>
  );
}
