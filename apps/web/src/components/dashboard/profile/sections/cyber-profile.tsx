import { Award } from "lucide-react";
import { SectionCard } from "../ui";
import { ComingSoon } from "../coming-soon";

export function CyberProfileSection() {
  return (
    <SectionCard
      title="Cybersecurity Profile"
      description="Certifications, training, badges, and your security level."
    >
      <ComingSoon
        icon={Award}
        title="No badges earned yet"
        description="Complete your first lab to start earning a verifiable skills passport — certifications and training history will show up here too."
        linkHref="/passport"
        linkLabel="View skills passport"
      />
    </SectionCard>
  );
}
