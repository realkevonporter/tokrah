import { Button, Dimensions, ImageSourcePropType, Pressable, StyleSheet, Text, View } from 'react-native'
import React, { Component, JSX, useCallback, useEffect, useRef, useState } from 'react'
import { Swiper, SwiperCardRefType } from 'rn-swiper-list';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Card } from '@/types/card.type';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { calculateAge } from '@/utils/birthday-to-age.util';
import { match } from '@/api/match';
import { User } from '@/types/user.type';
import { Image } from 'expo-image';
import Images from '@/constants/images';
import { matchIdAtom, matchUserAtom } from '@/storage/atom/match.atom';
import { profilePlaceholder } from '@/utils/profile-avatar-placeholder';
import { WigglySpringConfig } from 'react-native-reanimated';
import { cardsAtom, cardsStateAtom } from "@/storage/atom/cards.atom";
import { genderAtom, maxAgeAtom, maxHeightAtom, minAgeAtom, minHeightAtom, radiusAtom } from "@/storage/atom/filter.atom";
import { authLocationAtom } from '@/storage/atom/location.atom';
import { getUsers, updateFilter } from '@/api/card';
import * as Haptics from 'expo-haptics';
import ImagePositionTracker from '@/components/ui/ImagePositionTracker';
import { ThemedText } from '@/components/themed-text';
import ZodiacSign from '@/components/ZodiacSign';
import { inchesToFeetInches } from '@/utils/inches-to-feet-inches';

const Deck = () => {
    const ref = useRef<SwiperCardRefType>(null);

    const loading = useAtomValue(cardsStateAtom);
    const setMatchedUser = useSetAtom(matchUserAtom);
    const setMatchId = useSetAtom(matchIdAtom);
    const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

    const [cards, setCards] = useAtom(cardsAtom);
    const location = useAtomValue(authLocationAtom);
    const setCardsLoadingStatus = useSetAtom(cardsStateAtom);

    const minAge = useAtomValue(minAgeAtom);
    const maxAge = useAtomValue(maxAgeAtom);
    const gender = useAtomValue(genderAtom);
    const minHeight = useAtomValue(minHeightAtom);
    const maxHeight = useAtomValue(maxHeightAtom);
    const radius = useAtomValue(radiusAtom);
    const [swiperKey, setSwiperKey] = useState(0);

    const [cardIndex, setCardIndex] = useState(0)
    const [mediaIndex, setMediaIndex] = useState(0);

    const [imageError, setImageError] = useState(false);

    const fetchUsers = async () => {
        setCardsLoadingStatus(true)
        const data: Card[] = await getUsers(
            minAge,
            maxAge,
            gender,
            minHeight,
            maxHeight,
            location?.coords,
            radius
        );
        setCards(data);
        setSwiperKey(prev => prev + 1)
        setCardsLoadingStatus(false)
    };

    const updateMatchFilter = async () => {
        setCardsLoadingStatus(true)
        try {
            const res = await updateFilter(
                minAge,
                maxAge,
                gender,
                minHeight,
                maxHeight,
                radius
            );

            fetchUsers()
        } catch (err) {
            console.log(err)
        }


        setCardsLoadingStatus(false)
    };

    useEffect(() => {
        updateMatchFilter();
    }, [minAge, maxAge, minHeight, maxHeight, gender, radius]);

    useEffect(() => {
        const currentCard = cards[cardIndex];
        if (!currentCard) return;

        const urls = currentCard.medias
            .slice(mediaIndex + 1, mediaIndex + 3)
            .map(m => m?.url)
            .filter(Boolean);

        if (urls.length) {
            Image.prefetch(urls);
        }
    }, [mediaIndex, cardIndex]);

    const renderCard = useCallback((card: Card) => {
        const currentMedia = card.medias[mediaIndex];
        const nextMedia = card.medias[mediaIndex + 1];

        return (
            <View style={styles.renderCardContainer}>

                <View style={styles.renderCardImage}>
                    <Image
                        source={profilePlaceholder(card.gender)}
                        contentFit="cover"
                        style={StyleSheet.absoluteFill}
                    />

                    {!imageError && (
                        <View style={StyleSheet.absoluteFill}>
                            {/* CURRENT IMAGE */}
                            <Image
                                source={currentMedia?.url}
                                style={StyleSheet.absoluteFill}
                                contentFit="cover"
                                cachePolicy="memory-disk"
                            />

                            {/* NEXT IMAGE (preloaded & hidden) */}
                            {nextMedia?.url && (
                                <Image
                                    source={nextMedia.url}
                                    style={{ width: 0, height: 0, opacity: 0 }}
                                    cachePolicy="memory-disk"
                                />
                            )}
                        </View>
                    )}

                </View>


                <View style={{ position: 'absolute', bottom: 0, padding: 10, gap: 10, backgroundColor: '#0000009e', width: '100%' }}>
                    <Text style={styles.cardName}>{card.username}, {calculateAge(new Date(card.birthdate))}</Text>
                    <View style={{ flexDirection: 'row' }}>
                        <MaterialCommunityIcons color='#f7f7f7' name='map-marker' size={20} />
                        <Text style={styles.cardDistance}>{(card.distance_meters / 1609.34).toFixed(1)} miles away</Text>
                    </View>

                    <Text style={styles.cardBio}>{card.bio}</Text>

                </View>

                <View style={{ flexDirection: 'row', position: 'absolute', width: '100%', height: '100%' }}>
                    <Pressable
                        style={{ flex: 1 }}
                        onPress={() => {
                            Haptics.notificationAsync()
                            setMediaIndex(prev => Math.max(prev - 1, 0));
                        }}
                    />
                    <Pressable
                        style={{ flex: 1 }}
                        onPress={() => {
                            Haptics.notificationAsync()
                            if (mediaIndex < card.medias.length - 1) {
                                setMediaIndex(prev => prev + 1);
                            } else {
                                setMediaIndex(0);
                            }
                        }}
                    />
                </View>

                <Pressable
                    style={[styles.button, { position: 'absolute', bottom: 130, right: 10 }]}
                    onPress={() => {
                        ref.current?.flipCard();
                    }}
                >
                    <MaterialCommunityIcons name="sync" size={30} color="white" />
                </Pressable>

                <ImagePositionTracker
                    total={card.medias.length}
                    current={mediaIndex}
                    style={{
                        position: 'absolute',
                        top: 10,
                        left: 10,
                        right: 10,
                    }}
                />

            </View>
        );
    }, [mediaIndex]);


    const renderFlippedCard = useCallback(
        (_: Card, index: number) => {
            return (
                <View style={styles.renderFlippedCardContainer}>
                    <View>
                        <ZodiacSign birthday={_.birthdate} />
                    </View>
                                   <View>
                        <ThemedText>{inchesToFeetInches(_.height)}</ThemedText>
                    </View>
                    <Text style={styles.text}>{_.bio}</Text>
                    <Pressable
                        style={[styles.button, { position: 'absolute', bottom: 130, right: 10 }]}
                        onPress={() => {
                            ref.current?.flipCard();
                        }}
                    >
                        <MaterialCommunityIcons name="sync" size={30} color="white" />
                    </Pressable>
                </View>
            );
        },
        []
    );
    const OverlayLabelRight = useCallback(() => {
        return (
            <View
                style={[
                    styles.overlayLabelContainer,
                    {
                        backgroundColor: 'green',
                    },
                ]}
            />
        );
    }, []);
    const OverlayLabelLeft = useCallback(() => {
        return (
            <View
                style={[
                    styles.overlayLabelContainer,
                    {
                        backgroundColor: 'red',
                    },
                ]}
            />
        );
    }, []);
    const OverlayLabelTop = useCallback(() => {
        return (
            <View
                style={[
                    styles.overlayLabelContainer,
                    {
                        backgroundColor: 'blue',
                    },
                ]}
            />
        );
    }, []);
    const OverlayLabelBottom = useCallback(() => {
        return (
            <View
                style={[
                    styles.overlayLabelContainer,
                    {
                        backgroundColor: 'orange',
                    },
                ]}
            />
        );
    }, []);

    return (
        <GestureHandlerRootView style={styles.container}>
            <View style={styles.subContainer}>
                <Swiper
                    key={swiperKey}
                    translateXRange={[200, 200]}
                    ref={ref}
                    data={cards}
                    keyExtractor={(item) => item.id}
                    swipeVelocityThreshold={500}
                    initialIndex={0}
                    disableBottomSwipe
                    disableTopSwipe

                    cardStyle={styles.cardStyle}
                    overlayLabelContainerStyle={styles.overlayLabelContainerStyle}
                    prerenderItems={2}
                    renderCard={renderCard}
                    onIndexChange={(index) => {
                        console.log('Current Active index', index);
                        setCardIndex(index)
                    }}
                    onSwipeRight={async (cardIndex) => {
                        try {
                            const res = await match(cards[cardIndex].id);
                            if (res?.matched) {
                                setMatchedUser(cards[cardIndex]);
                                setMatchId(res?.match?.id);
                            }
                        } catch (error) {
                            console.log('unable to match with user: ', error)
                        }

                        setMediaIndex(0)

                        console.log('card index username:', cards[cardIndex].username)
                        console.log('cardIndex', cardIndex);
                    }}

                    onSwipedAll={() => {
                        console.log('onSwipedAll');
                    }}
                    FlippedContent={renderFlippedCard}
                    onSwipeLeft={(cardIndex) => {
                        console.log('onSwipeLeft', cardIndex);
                        setMediaIndex(0)
                    }}
                    onSwipeTop={(cardIndex) => {
                        console.log('onSwipeTop', cardIndex);
                    }}
                    onSwipeBottom={(cardIndex) => {
                        console.log('onSwipeBottom', cardIndex);
                    }}
                    OverlayLabelRight={OverlayLabelRight}
                    OverlayLabelLeft={OverlayLabelLeft}
                    OverlayLabelTop={OverlayLabelTop}
                    OverlayLabelBottom={OverlayLabelBottom}
                    onSwipeActive={() => {
                        console.log('onSwipeActive');
                    }}
                    onSwipeStart={() => {
                        console.log('onSwipeStart');
                    }}
                    onSwipeEnd={() => {
                        console.log('onSwipeEnd');
                    }}
                />
            </View>

            <View style={styles.buttonsContainer}>

                <Pressable
                    style={[styles.button, { backgroundColor: '#c8a122ff' }]}
                    onPress={() => {
                        ref.current?.swipeBack();
                    }}
                >
                    <MaterialCommunityIcons name="reload" size={30} color="white" />
                </Pressable>
                <Pressable
                    style={[styles.button, { backgroundColor: '#a22e4bff' }]}
                    onPress={() => {
                        ref.current?.swipeLeft();
                    }}
                >
                    <MaterialCommunityIcons name="close" size={30} color="white" />
                </Pressable>
                <Pressable
                    style={[styles.button, { display: 'none' }]}
                    onPress={() => {
                        ref.current?.swipeBottom();
                    }}
                >
                    <MaterialCommunityIcons name="arrow-down" size={30} color="white" />
                </Pressable>
                <Pressable
                    style={[styles.button, { display: 'none' }]}
                    onPress={() => {
                        ref.current?.swipeTop();
                    }}
                >
                    <MaterialCommunityIcons name="arrow-up" size={30} color="white" />
                </Pressable>
                <Pressable
                    style={[styles.button, { backgroundColor: '#2ea25aff' }]}
                    onPress={() => {
                        ref.current?.swipeRight();
                    }}
                >
                    <MaterialCommunityIcons name="heart" size={30} color="white" />
                </Pressable>
            </View>
        </GestureHandlerRootView>
    )
}

export default Deck

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'tr',
    },
    buttonsContainer: {
        flexDirection: 'row',
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    button: {
        height: 50,
        borderRadius: 40,
        aspectRatio: 1,
        backgroundColor: '#3A3D45',
        elevation: 4,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'black',
        shadowOpacity: 0.1,
        shadowOffset: {
            width: 0,
            height: 4,
        },
    },
    renderCardContainer: {
        borderRadius: 15,
        width: '100%',
        height: '100%',
        bottom: 20,
        overflow: 'hidden'
    },
    renderFlippedCardContainer: {
        borderRadius: 15,
        backgroundColor: '#baeee5',
        width: '100%',
        height: '100%',
        bottom: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    cardStyle: {
        width: '100%',
        height: '100%',
        borderRadius: 15,
        justifyContent: 'center',
        alignItems: 'center',
    },
    renderCardImage: {
        height: '100%',
        width: '100%',
        borderRadius: 15,
        overflow: 'hidden',
        backgroundColor: '#1a1a1a',
    },
    cardName: {
        color: '#f7f7f7',
        fontSize: 24,
        fontWeight: 500,
    },
    cardDistance: {
        color: '#f7f7f7',
        fontSize: 18,
        fontWeight: 300,
    },
    cardBio: {
        color: '#f7f7f7',
        fontSize: 16,
        fontWeight: 300,
    },
    subContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overlayLabelContainer: {
        borderRadius: 15,
        height: '100%',
        width: '100%',
        bottom: 20,
        opacity: .5,
    },
    text: {
        color: '#001a72',
    },
    overlayLabelContainerStyle: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});