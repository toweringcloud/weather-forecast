import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import { Fontisto } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
	View,
	Text,
	Dimensions,
	ActivityIndicator,
	StyleSheet,
	ScrollView,
} from "react-native";
import { API_URL, API_KEY } from "@env";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const icons = {
	Atmosphere: "cloudy-gusts",
	Clear: "day-sunny",
	Clouds: "cloudy",
	Drizzle: "rain",
	Rain: "rains",
	Snow: "snow",
	Thunderstorm: "lightning",
};

export default function App() {
	const [city, setCity] = useState("Loading...");
	const [days, setDays] = useState([]);
	const [ok, setOk] = useState(true);

	const getDate = (time) => {
		const date = new Date(time * 1000);
		return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
	};
	const getWeather = async () => {
		const { granted } = await Location.requestForegroundPermissionsAsync();
		if (!granted) {
			setOk(false);
			return;
		}

		const {
			coords: { latitude, longitude },
		} = await Location.getCurrentPositionAsync({ accuracy: 5 });
		const location = await Location.reverseGeocodeAsync(
			{ latitude, longitude },
			{ useGoogleMaps: false }
		);
		setCity(location[0].city);

		const response = await fetch(
			`${API_URL}/onecall?lat=${latitude}&lon=${longitude}&exclude=alerts&appid=${API_KEY}&units=metric`
		);
		const json = await response.json();
		setDays(json.daily);
	};

	useEffect(() => {
		getWeather();
	}, []);

	return (
		<View style={styles.container}>
			<StatusBar style="light" />
			<View style={styles.city}>
				<Text style={styles.cityName}>{city}</Text>
			</View>
			<ScrollView
				pagingEnabled
				horizontal
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={styles.weather}
			>
				{days.length === 0 ? (
					<View style={{ ...styles.day, alignItems: "center" }}>
						<ActivityIndicator
							color="white"
							style={{ marginTop: 10 }}
							size="large"
						/>
					</View>
				) : (
					days.map((day, index) => (
						<View key={index} style={styles.day}>
							<View
								style={{
									justifyContent: "flex-start",
									alignItems: "center",
								}}
							>
								<Text style={styles.temp}>
									{parseFloat(day.temp.day).toFixed(1)}°
								</Text>
								<Text style={styles.specificDate}>
									{getDate(day.dt)}
								</Text>
							</View>
							<View
								style={{
									justifyContent: "flex-end",
									alignItems: "center",
								}}
							>
								<Fontisto
									name={icons[day.weather[0].main]}
									size={84}
									color="white"
								/>
								<Text style={styles.description}>
									{day.weather[0].main}
								</Text>
								<Text style={styles.tinyText}>
									{day.weather[0].description}
								</Text>
							</View>
						</View>
					))
				)}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: "tomato",
	},
	city: {
		flex: 1.5,
		justifyContent: "center",
		alignItems: "center",
	},
	cityName: {
		fontSize: 58,
		fontWeight: "500",
		color: "white",
	},
	weather: {},
	day: {
		width: SCREEN_WIDTH,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "flex-start",
		paddingHorizontal: 20,
	},
	temp: {
		fontSize: 120,
		fontWeight: "600",
		color: "white",
	},
	description: {
		marginTop: 10,
		fontSize: 30,
		fontWeight: "500",
		color: "white",
	},
	tinyText: {
		marginTop: -5,
		color: "white",
		fontSize: 25,
		fontWeight: "500",
	},
	specificDate: {
		fontSize: 25,
		fontWeight: "600",
		color: "black",
	},
});
