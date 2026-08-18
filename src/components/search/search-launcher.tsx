import { getTrendingDestinations } from "@/lib/trending-destinations";
import { SearchExperience } from "@/components/search/search-experience";
import { parseGuestsFromParams } from "@/lib/guests";

export async function SearchLauncher({
  defaultDestination,
  defaultCheckIn,
  defaultCheckOut,
  searchParams,
}: {
  defaultDestination?: string;
  defaultCheckIn?: string;
  defaultCheckOut?: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const destinations = await getTrendingDestinations(8);
  const guests = parseGuestsFromParams(searchParams ?? {});

  return (
    <SearchExperience
      destinations={destinations}
      defaultDestination={defaultDestination}
      defaultCheckIn={defaultCheckIn}
      defaultCheckOut={defaultCheckOut}
      defaultGuests={guests}
    />
  );
}
