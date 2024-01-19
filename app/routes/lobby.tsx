
export default function Lobby() {
  return (
    <div className="flex flex-col bg-gradient-to-b from-blue-300 to-blue-200 h-[calc(100dvh)]">
      <div className="flex">
        <div className="flex flex-col p-2">
          <p className="text-2xl font-semibold text-black">
            Lobby (3/4)
          </p>
          <div className="flex flex-col gap-2 py-2">
            <div className="flex items-center w-32 sm:w-40 h-12 bg-slate-700 rounded shadow-lg">
              <p className="text-white text-lg px-2 truncate">Bryan</p>
            </div>
            <div className="flex items-center w-32 sm:w-40 h-12 bg-white rounded shadow-lg">
              <p className="text-black text-lg px-2 truncate">Player 2</p>
            </div>
            <div className="flex items-center w-32 sm:w-40 h-12 bg-white rounded shadow-lg">
              <p className="text-black text-lg px-2 truncate">Player 3</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2 p-2 ml-auto">
          <div className="flex justify-center items-center w-12 h-12 bg-white rounded shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex justify-center items-center w-12 h-12 bg-white rounded shadow-lg">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 0 0-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 0 0-2.282.819l-.922 1.597a1.875 1.875 0 0 0 .432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 0 0 0 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 0 0-.432 2.385l.922 1.597a1.875 1.875 0 0 0 2.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 0 0 2.28-.819l.923-1.597a1.875 1.875 0 0 0-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 0 0 0-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 0 0-2.282-.818l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 0 0-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 0 0-1.85-1.567h-1.843ZM12 15.75a3.75 3.75 0 1 0 0-7.5 3.75 3.75 0 0 0 0 7.5Z" clipRule="evenodd" />
            </svg>
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center py-28 mt-auto">
        <div className="flex p-10 rounded-full bg-green-500 w-56 h-48 shadow-xl">
          <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-100 shadow-inner shadow-gray-400"></div>
        </div>
      </div>
    </div>
  )
}