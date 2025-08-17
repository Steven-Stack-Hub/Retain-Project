export default function RefreshMeter({ current, total }) {
  const percent = (current / total) * 100;
  return (
    <div className="mt-2">
      <small>Refreshes: {current}/{total}</small>
      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all"
          style={{ width: `${percent}%` }}
        ></div>
      </div>
    </div>
  );
}