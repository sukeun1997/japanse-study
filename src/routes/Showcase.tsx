import { useParams, useNavigate } from "react-router-dom";

export default function Showcase() {
  const { id } = useParams();
  const nav = useNavigate();
  return (
    <div className="p-4">
      <button onClick={() => nav(-1)} className="text-sm text-gray-500">← 닫기</button>
      <p className="mt-4 text-4xl jp">{id}</p>
    </div>
  );
}
