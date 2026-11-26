import Button from '../components/ui/Button';
import MonoLine from '../components/ui/MonoLine';

export default function NotFound() {
  return (
    <section className="flex flex-col items-center py-24 text-center">
      <MonoLine path="~/error" command="404" />
      <h1 className="mt-5 text-5xl sm:text-6xl">
        Page <span className="text-highlight">not found.</span>
      </h1>
      <p className="mt-4 max-w-md">This situation doesn&apos;t exist yet. Let&apos;s go back to the topics.</p>
      <Button to="/" className="mt-8">
        Back home
      </Button>
    </section>
  );
}
