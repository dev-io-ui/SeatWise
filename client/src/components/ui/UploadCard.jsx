import { UploadCloud } from "lucide-react";
import { useForm } from "react-hook-form";
import Button from "./Button.jsx";
import Card from "./Card.jsx";

export default function UploadCard({
  title,
  description,
  hint,
  onUpload,
  loading = false,
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const submitUpload = async ({ file }) => {
    await onUpload(file[0]);
    reset();
  };

  return (
    <Card
      title={title}
      subtitle={description}
      className="h-full bg-gradient-to-br from-white to-primarySoft/40"
    >
      <form className="space-y-4" onSubmit={handleSubmit(submitUpload)}>
        <div className="rounded-3xl border border-dashed border-primary/30 bg-white/80 p-5 text-center">
          <UploadCloud className="mx-auto mb-3 h-10 w-10 text-primary" />
          <input
            type="file"
            accept=".csv,.xlsx"
            className="block w-full text-sm text-muted file:mr-4 file:rounded-full file:border-0 file:bg-accentSoft file:px-4 file:py-2 file:font-semibold file:text-[#A24E00]"
            {...register("file", { required: "Choose a CSV or Excel file." })}
          />
          <p className="mt-3 text-xs text-muted">{hint}</p>
          {errors.file ? <p className="mt-2 text-xs font-medium text-[#C2410C]">{errors.file.message}</p> : null}
        </div>
        <Button type="submit" variant="accent" className="w-full" loading={loading}>
          Upload File
        </Button>
      </form>
    </Card>
  );
}
