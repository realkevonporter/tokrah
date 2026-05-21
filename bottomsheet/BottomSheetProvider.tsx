import React, { createContext, useContext, useRef, useCallback, useState, useMemo } from 'react';
import BottomSheet, {
    BottomSheetBackdrop,
    BottomSheetBackdropProps,
    BottomSheetView,
    BottomSheetModalProvider,
} from '@gorhom/bottom-sheet';
import { StyleSheet } from 'react-native';
import { FilterSheet } from '@/bottomsheet/FilterSheet';
import { CommentSheet } from '@/bottomsheet/CommentSheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from "react-native";
import { Colors } from '@/constants/theme';



type SheetType = 'likes' | 'comments' | 'filter' | 'events' | 'share' | 'profile-actions' | null;

interface BottomSheetContextProps {
    openSheet: (type: SheetType, data?: any) => void;
    closeSheet: () => void;
}

const BottomSheetContext = createContext<BottomSheetContextProps>({
    openSheet: () => { },
    closeSheet: () => { },
});

export const useBottomSheet = () => useContext(BottomSheetContext);

export const BottomSheetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const colorScheme = useColorScheme();
    const bottomSheetRef = useRef<BottomSheet>(null);
    const [sheetType, setSheetType] = useState<SheetType>(null);
    const [sheetData, setSheetData] = useState<any>(null);
    const safe = useSafeAreaInsets();

    // ✅ Dynamic snap points based on sheet type
    const snapPoints = useMemo(() => {
        switch (sheetType) {
            case 'comments':
                return ['50%', '70%']; // Comments need more space
            case 'filter':
                return ['50%', '70%']; // Simple filter sheet
            default:
                return ['25%', '50%']; // Default
        }
    }, [sheetType]);

    const openSheet = useCallback((type: SheetType, data?: any) => {
        setSheetType(type);
        setSheetData(data || null);
        // ✅ Always open the largest snap point (last index)
        setTimeout(() => {
            bottomSheetRef.current?.snapToIndex(snapPoints.length - 1);
        }, 50);
    }, [snapPoints]);

    const closeSheet = useCallback(() => {
        bottomSheetRef.current?.close();
        setSheetType(null);
        setSheetData(null);
    }, []);

    const renderSheetContent = () => {
        switch (sheetType) {

            case 'comments':
                return <CommentSheet postId={sheetData?.id} onClose={closeSheet} />;
            case 'filter':
                return <FilterSheet />;
            default:
                return null;
        }
    };

    const renderBackdrop = useCallback(
        (props: BottomSheetBackdropProps) => (
            <BottomSheetBackdrop appearsOnIndex={0} disappearsOnIndex={-1} {...props} />
        ),
        []
    );

    return (
        <BottomSheetModalProvider>
            <BottomSheetContext.Provider value={{ openSheet, closeSheet }}>
                {children}
                <BottomSheet
                    enableContentPanningGesture={false}
                    enableDynamicSizing={true}
                    keyboardBehavior="extend"
                    keyboardBlurBehavior="restore"
                    ref={bottomSheetRef}
                    index={-1}
                    snapPoints={snapPoints}
                    backdropComponent={renderBackdrop}
                    enablePanDownToClose
                    onClose={closeSheet}
                    backgroundStyle={[styles.sheetBackground,
                    { backgroundColor: colorScheme === 'dark' ? Colors.dark.filtersheet.background : Colors.light.filtersheet.background }
                    ]}
                >
                    <BottomSheetView style={[styles.sheetContent, { paddingBottom: safe.bottom }]}>
                        {renderSheetContent()}
                    </BottomSheetView>
                </BottomSheet>
            </BottomSheetContext.Provider>
        </BottomSheetModalProvider>
    );
};

const styles = StyleSheet.create({
    sheetBackground: {
        borderTopLeftRadius: 16,
        borderTopRightRadius: 16,
    },
    sheetContent: {
        padding: 16,
        flex: 1,
    },
});
