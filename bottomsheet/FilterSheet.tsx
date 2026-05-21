import React, { useCallback, useEffect, useState } from "react";
import { View, StyleSheet, TouchableOpacity, Platform } from "react-native";
import MultiSlider from "@ptomasroos/react-native-multi-slider";
import { useAtom, useSetAtom } from "jotai";

import {
  genderAtom,
  maxAgeAtom,
  maxHeightAtom,
  minAgeAtom,
  minHeightAtom,
  radiusAtom,
} from "@/storage/atom/filter.atom";

import { ThemedView } from "@/components/themed-view";
import { ThemedText } from "@/components/themed-text";
import { getUsers, updateFilter } from "@/api/card";
import { Colors } from "@/constants/theme";


const GENDERS = ["MALE", "FEMALE"] as const;

type FilterSectionProps = {
  title: string;
  children: React.ReactNode;
};

const FilterSection = ({ title, children }: FilterSectionProps) => (
  <ThemedView darkColor={Colors.dark.filtersheet.background2} lightColor={Colors.light.filtersheet.background2} style={styles.section}>
    <ThemedText style={styles.label}>{title}</ThemedText>
    {children}
  </ThemedView>
);

export const FilterSheet = () => {

 
  

  const [gender, setGender] = useAtom(genderAtom);
const [minAge, setMinAge] = useAtom(minAgeAtom);
  const [maxAge, setMaxAge] = useAtom(maxAgeAtom);
  const [minHeight, setMinHeight] = useAtom(minHeightAtom);
  const [maxHeight, setMaxHeight] = useAtom(maxHeightAtom);
  const [radius, setRadius] = useAtom(radiusAtom);

const [localHeightRange, setLocalHeightRange] = useState<[number, number]>([minHeight, maxHeight]);
 const [localAgeRange, setLocalAgeRange] = useState<[number, number]>([minAge, maxAge]);

  const onReset = useCallback(() => {
    setMinAge(18);
    setMaxAge(60);
    setMinHeight(40);
    setMaxHeight(80);
    setGender("FEMALE");
    setRadius(50);
  }, []);

  const onApply = useEffect(() => {

    // trigger refetch or close sheet if needed
    const filter = async()=>{
      await updateFilter(minAge, maxAge, gender, minHeight, maxHeight, radius)
    }

    filter()
  }, [minHeight, maxHeight, gender, minAge, maxAge, radius]);

  return (
    <View style={styles.container}>
      <ThemedText type="defaultSemiBold" style={{fontSize: 20, fontWeight:'300', marginBottom:8,}}>Whats your preference?</ThemedText>

      {/* AGE */}
      <FilterSection title="Age range">
        <MultiSlider
        containerStyle={{padding:20}}
          values={[minAge, maxAge]}
          onValuesChangeFinish={(v)=>{
            setMinAge(v[0]);
            setMaxAge(v[1]);
          }}
          min={18}
          max={100}
          step={1}
          onValuesChange={()=>setLocalAgeRange}
          sliderLength={300}
          trackStyle={styles.track}
          markerStyle={styles.marker}
          selectedStyle={styles.selected}
          unselectedStyle={styles.unselected}
        />
      </FilterSection>

      {/* HEIGHT */}
      <FilterSection title="Height (inches)">
        <MultiSlider
        containerStyle={{padding:20}}
          values={[minHeight, maxHeight]}
          min={40}
          max={85}
          step={1}
          onValuesChangeFinish={(v)=>{
            setMinHeight(v[0]);
            setMaxHeight(v[1])
          }}
          onValuesChange={() => setLocalHeightRange}
          sliderLength={300}
          trackStyle={styles.track}
          markerStyle={styles.marker}
          selectedStyle={styles.selected}
          unselectedStyle={styles.unselected}
        />
      </FilterSection>

      {/* DISTANCE */}
      <FilterSection title="Distance (miles)">
        <MultiSlider
        containerStyle={{padding:20}}
          values={[radius]}
          min={1}
          max={100}
          step={1}
          onValuesChange={(v) => setRadius(v[0])}
          sliderLength={300}
          trackStyle={styles.track}
          markerStyle={styles.marker}
          selectedStyle={styles.selected}
          unselectedStyle={styles.unselected}
        />
      </FilterSection>

      {/* GENDER */}
      <FilterSection title="Gender">
        <View style={styles.genderRow}>
          {GENDERS.map((g) => {
            const active = gender === g;

            return (
              <TouchableOpacity
                key={g}
                onPress={() => setGender(g)}
                style={[styles.genderBtn, active && styles.genderActive]}
              >
                <ThemedText style={active ? styles.genderTextActive : styles.genderText}>
                  {g.toLowerCase()}
                </ThemedText>
              </TouchableOpacity>
            );
          })}
        </View>
      </FilterSection>

      {/* ACTIONS */}
      <View style={styles.buttons}>
        <TouchableOpacity style={styles.resetButton} onPress={onReset}>
          <ThemedText style={styles.resetText}>Reset</ThemedText>
        </TouchableOpacity>


      </View>

      {Platform.OS === "android" && <View style={{ height: 20 }} />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    alignItems: "center",
  },

  section: {
    width: "100%",
    marginBottom: 20,
    borderRadius:10,
  },

  label: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },

  marker: {
    height: 20,
    width: 20,
    marginBottom:-15,
    borderRadius: 13,
    backgroundColor: Colors.dark.tint,
  },

  track: {
    height:15,
    borderRadius:8,
  },

  selected: {
    backgroundColor: "#fff9cfff",
  },

  unselected: {
    backgroundColor: "#e6e6e6",
  },

  genderRow: {
    flexDirection: "row",
    gap: 10,
    padding:10,
  },

  genderBtn: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: "#eee",
  },

  genderActive: {
    backgroundColor: Colors.dark.tint,
  },

  genderText: {
    color: "#333",
    fontWeight: "600",
  },

  genderTextActive: {
    color: "#fff",
    fontWeight: "600",
  },

  buttons: {
    flexDirection: "row",
    width: "100%",
    marginTop: 20,
    gap: 10,
  },

  resetButton: {
    flex: 1,
    backgroundColor: "#f0f0f0",
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  applyButton: {
    flex: 1,
    backgroundColor: Colors.dark.tint,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  resetText: {
    color: "#333",
    fontWeight: "600",
  },

  applyText: {
    color: "#fff",
    fontWeight: "600",
  },
});