import { DEVICES } from "@/lib/constants";
import DeviceCard from "@/components/DeviceCard";
import SectionHeading from "@/components/SectionHeading";

export default function Devices() {
  return (
    <section id="devices" className="page-section">
      <SectionHeading
        title={
          <>
            <span className="sm:hidden">
              <span className="block">We Provide you streaming</span>
              <span className="block">experience across various devices.</span>
            </span>
            <span className="hidden sm:inline">
              We Provide you streaming experience across various devices.
            </span>
          </>
        }
        description={
          <>
            <span className="sm:hidden">
              <span className="block">
                With StreamVibe, you can enjoy your favorite movies
              </span>
              <span className="block">and TV shows anytime, anywhere.</span>
            </span>
            <span className="hidden sm:inline">
              With StreamVibe, you can enjoy your favorite movies and TV shows
              anytime, anywhere.
            </span>
          </>
        }
      />

      <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 lg:gap-6">
        {DEVICES.map((device) => (
          <DeviceCard
            key={device.title}
            title={device.title}
            description={device.description}
            iconSrc={device.iconSrc}
          />
        ))}
      </div>
    </section>
  );
}
