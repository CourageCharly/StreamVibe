import { DEVICES } from "@/lib/constants";
import DeviceCard from "@/components/DeviceCard";
import SectionHeading from "@/components/SectionHeading";

export default function Devices() {
  return (
    <section id="devices" className="page-section">
      <SectionHeading
        title="We Provide you streaming experience across various devices."
        description="With StreamVibe, you can enjoy your favorite movies and TV shows anytime, anywhere."
        singleLine
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
