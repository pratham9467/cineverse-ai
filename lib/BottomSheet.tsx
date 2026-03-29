import React, { useEffect, useRef } from 'react'
import {
    Animated,
    Dimensions,
    Easing,
    Modal,
    PanResponder,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native'

const { height: SCREEN_HEIGHT } = Dimensions.get('window')

interface BottomSheetProps {
    visible: boolean
    onClose: () => void
    title: string
    children: React.ReactNode
    /** Height as percentage of screen height (0.5 = 50%). Default: 0.7 */
    heightPercent?: number
}

const BottomSheet = ({ visible, onClose, title, children, heightPercent = 0.7 }: BottomSheetProps) => {
    const translateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current
    const backdropOpacity = useRef(new Animated.Value(0)).current
    const sheetHeight = SCREEN_HEIGHT * heightPercent

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 1,
                    duration: 300,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: 0,
                    duration: 300,
                    easing: Easing.out(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start()
        } else {
            Animated.parallel([
                Animated.timing(backdropOpacity, {
                    toValue: 0,
                    duration: 200,
                    useNativeDriver: true,
                }),
                Animated.timing(translateY, {
                    toValue: SCREEN_HEIGHT,
                    duration: 250,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: true,
                }),
            ]).start()
        }
    }, [visible, backdropOpacity, translateY])

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return gestureState.dy > 5
            },
            onPanResponderMove: (_, gestureState) => {
                if (gestureState.dy > 0) {
                    translateY.setValue(gestureState.dy)
                }
            },
            onPanResponderRelease: (_, gestureState) => {
                if (gestureState.dy > 100 || gestureState.vy > 0.5) {
                    onClose()
                } else {
                    Animated.timing(translateY, {
                        toValue: 0,
                        duration: 200,
                        easing: Easing.out(Easing.cubic),
                        useNativeDriver: true,
                    }).start()
                }
            },
        })
    ).current

    return (
        <Modal
            visible={visible}
            transparent
            animationType="none"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.container}>
                {/* Backdrop */}
                <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
                    <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
                </Animated.View>

                {/* Sheet */}
                <Animated.View
                    style={[
                        styles.sheet,
                        {
                            height: sheetHeight,
                            transform: [{ translateY }],
                        },
                    ]}
                >
                    {/* Drag handle */}
                    <View {...panResponder.panHandlers} style={styles.handleContainer}>
                        <View style={styles.handle} />
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                        <Text style={styles.title}>{title}</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Content */}
                    <View style={styles.content}>
                        {children}
                    </View>
                </Animated.View>
            </View>
        </Modal>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
    },
    sheet: {
        backgroundColor: '#0f1218',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.08)',
        borderBottomWidth: 0,
        overflow: 'hidden',
    },
    handleContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    handle: {
        width: 40,
        height: 4,
        borderRadius: 2,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    },
    title: {
        color: '#f1f5f9',
        fontSize: 18,
        fontWeight: '700',
    },
    closeButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeText: {
        color: '#94a3b8',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
    },
})

export default BottomSheet
