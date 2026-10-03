export interface AttributeGroup {
  title: string
  keys: [key: string, label: string][]
}

export const HITTING: AttributeGroup = {
  title: "Hitting",
  keys: [
    ["contact_left", "Contact vs L"],
    ["contact_right", "Contact vs R"],
    ["power_left", "Power vs L"],
    ["power_right", "Power vs R"],
    ["plate_vision", "Plate vision"],
    ["plate_discipline", "Plate discipline"],
    ["batting_clutch", "Batting clutch"],
    ["bunting_ability", "Bunting"],
    ["drag_bunting_ability", "Drag bunting"],
    ["hitting_durability", "Hitting durability"],
  ],
}

export const PITCHING: AttributeGroup = {
  title: "Pitching",
  keys: [
    ["stamina", "Stamina"],
    ["pitching_clutch", "Pitching clutch"],
    ["hits_per_bf", "Hits per BF"],
    ["k_per_bf", "K per BF"],
    ["bb_per_bf", "BB per BF"],
    ["hr_per_bf", "HR per BF"],
    ["pitch_velocity", "Velocity"],
    ["pitch_control", "Control"],
    ["pitch_movement", "Movement"],
  ],
}

export const FIELDING: AttributeGroup = {
  title: "Fielding",
  keys: [
    ["fielding_ability", "Fielding"],
    ["fielding_durability", "Fielding durability"],
    ["arm_strength", "Arm strength"],
    ["arm_accuracy", "Arm accuracy"],
    ["reaction_time", "Reaction"],
    ["blocking", "Blocking"],
  ],
}

export const RUNNING: AttributeGroup = {
  title: "Running",
  keys: [
    ["speed", "Speed"],
    ["baserunning_ability", "Baserunning"],
    ["baserunning_aggression", "Aggression"],
  ],
}

/**
 * Spelled-out names for the abbreviations roster updates use. Only abbreviations
 * seen in real responses and confidently understood are listed; unknown ones
 * (such as POP) render without a tooltip.
 */
export const ATTRIBUTE_NAMES: Record<string, string> = {
  CTRL: "Pitch control",
  STA: "Stamina",
  PCLT: "Pitching clutch",
  VIS: "Plate vision",
  "CON R": "Contact vs right",
  "CON L": "Contact vs left",
  "H/9 R": "Hits per 9 vs right",
  "H/9 L": "Hits per 9 vs left",
  "K/9 R": "Strikeouts per 9 vs right",
  "K/9 L": "Strikeouts per 9 vs left",
}
