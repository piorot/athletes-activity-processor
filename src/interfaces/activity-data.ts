import Lap from "./lap";
import Sample from "./sample";
import Summary from "./summary";

export default interface ActivityData {
  summary: Summary;
  laps: Lap[];
  samples: Sample[];
}
