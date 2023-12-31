import { FaceWidgets } from "../../components/widgets/FaceWidgets";

export let globalResult = [];

export default function FacePage() {
  return (
    <div
      className="md-20 flex flex-col items-center justify-center px-6 pt-10 pb-20 sm:px-10 md:px-14"
      style={{ backgroundColor: "#333373" }}
    >
      <img className="" src="/title.png" style={{ width: "500px" }} alt="" />
      <FaceWidgets />
    </div>
  );
}
