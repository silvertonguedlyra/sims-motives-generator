import MotivesDashboard from "@/components/motives-dashboard/MotivesDashboard"
export default function Home() {
    return (
      <div className="container">
        <div className="row">
          <div className="mt-4 col-8 col-md-4 mx-auto border rounded bg-secondary bg-opacity-10">
            <MotivesDashboard />
          </div>
        </div>
      </div>
    );
}