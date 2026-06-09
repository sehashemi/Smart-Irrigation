export default function SensorTable({ sensors }) {
  if (!sensors || sensors.length === 0) return <p>هیچ سنسوری موجود نیست</p>;

  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-bold mb-2">اطلاعات سنسورها</h2>
      <table className="w-full text-left border">
        <thead>
          <tr>
            <th className="border px-2">نام سنسور</th>
            <th className="border px-2">مقدار</th>
          </tr>
        </thead>
        <tbody>
          {sensors.map((s) => (
            <tr key={s.id}>
              <td className="border px-2">{s.name}</td>
              <td className="border px-2">{s.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
