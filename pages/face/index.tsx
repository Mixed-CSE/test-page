import { FaceWidgets } from "../../components/widgets/FaceWidgets";

export let globalResult = [];

export default function FacePage() {
  return (
    <div className="px-6 pt-10 pb-20 sm:px-10 md:px-14">
      <div className="pb-6 text-center text-4xl font-medium text-neutral-800">이해했니~?</div>
      <FaceWidgets />
    </div>
  );
}
