import { Media } from "@/types/media.type";
import { Image, StyleSheet } from "react-native";
import Sortable from "react-native-sortables";

export default function SortableGrid({
  medias,
  onReorder,
}: {
  medias: Media[];
  onReorder: (newOrder: Media[]) => void;
}) {
  return (
    <Sortable.Grid
      data={medias}
      keyExtractor={(item) => item.id} // REQUIRED
      columns={4}
      rowGap={10}
      columnGap={10}
      onDragEnd={(params: any) => {
        const newOrder: Media[] = Array.isArray(params) ? params : params?.data ?? params?.order ?? params?.items ?? [];
        onReorder(newOrder);
      }}
      renderItem={({ item }) => (
        <Image
          source={{ uri: item.url }}
          style={styles.media}
        />
      )}
    />
  );
}

const styles = StyleSheet.create({
  media: {
    width: 85,
    height: 140,
    borderRadius: 10,
  },
});
