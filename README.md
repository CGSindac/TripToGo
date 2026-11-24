# **TripToGo**
A community-centric tourism app that helps users generate plans for trips based on their location, local reviews, preferences, and budget. The app location and preferences is only Limited in Lipa City, Batangas.

# **Project Description**
TripToGo, in its current version, is a Java tourism app that helps you find places to go in Lipa City, Batangas. Pick a destination, browse restaurants, attractions, and shops, read community reviews, and get recommendations that match your preferences and budget.

It was built as an academic project to show Object-Oriented Programming (encapsulation, inheritance, polymorphism, abstraction, and composition) in a real-world app. It's meant for tourists and locals exploring Lipa City, and for students who want to see a practical OOP project.

# **Addressed Problem**

Unfamiliarity of location has always been a hindrance of enjoyment for tourists. Wherein unfamiliarity incites anxiety and indecisiveness which in turn, shifts the goal of tourist from enjoying the local to planning the most enjoyable but budget freindly trip to suit their tastes. TripToGo aims to solve that problem by making an application that does all the thinking for the tourist.

## **Project Objectives**

To develop a Java-based tourism recommendation system that helps discover local destinations through searchable place listings, community reviews, and predefined recommendation criteria while demonstrating fundamental Object-Oriented Programming concepts.

The application will aim to complete the following objectives:

1. Develop a basic account system with registration and login functionality
2. Organize tourism-related places into categories for easier browsing.
3.Provide users the ability to review places of interest, businesses, and attractions then upload it to TripToGo’s database.
4. Allow users to view the details, ratings, and community reviews of a business.
5. Implement a content-based recommendation system using user preferences and budget.
6. Implement administrator functions for maintaining place information.
7. Apply encapsulation, inheritance, polymorphism, abstraction, and composition in the system’s class design.

## **Target Users**

1. Tourists
2. Expand...


## **Features**
1. Accounts: sign up and log in to save your preferences.
2. Browse by category: find restaurants, things to do, and shops easily.
3. Ratings & reviews: read other people's reviews and add your own.
4. Recommendations: get place suggestions that fit your interests and budget.
5. Admin tools: admins can manage users, reviews, and place information.
## **Limitations**

TripToGo covers Lipa City, Batangas only, and these are not included:

- ❌ GPS detection and real-time navigation
- ❌ AI-based recommendations
- ❌ Online payments
- ❌ Bookings and reservations
- ❌ Live traffic and interactive maps
- ❌ Places outside Lipa City
- ❌ Automated review moderation

## **Tech Stack & Prerequisite**

### _Backend_ 
| Tool | Version / Recommendation | Description |
| :--- | :--- | :--- |
| **Java (JDK)** | 17 or later | Language used |
| **PostgreSQL** | 18.6 or later | Database|
| **Spring Boot** | 4.0 | Backend Framwork for Java|
| **Apache Maven** | 3.10 | Java build & project management tool|
| **Git** | Any recent version | Version Control|
| **IDE / Text Editor (Optional)** | IntelliJ IDEA, Eclipse, or VS Code | |

Check your versions:

```bash
java -version
mvn -version
postgres --version
```


### _Frontend_ 
| Tool | Version / Recommendation | Description |
| :--- | :--- | :--- |
| **[add]** | 17 or later | Language used |

## **TripToGo Team**

| Name | Github Username | Role |
| :--- | :---: | ---: |
| Calix Gabriel B. Sindac | 🧂 | Project Lead, Backend |
| Wiljosh N. Bicomong| 🍄 | Full Stack  |
| Kristine Ann L. Malaluan | 🌵 | Frontend |


## **Installation**

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/TripToGo.git
cd TripToGo

# 2. Create the database
mysql -u root -p -e "CREATE DATABASE triptogo;"
```
## **Usage**

### _For USERS:_
1. Register a new account, or log in if you already have one.
2. Set your preferences and budget (e.g., cafés, ₱500).
3. Select a destination or browse by category.
4. View place details, ratings, and reviews.
5. Get recommendations, then leave a review after your visit.

#### _For ADMINS:_
1. Access the admin pannels
2. Manage reviews
3. Authenticate places, details, ratings, and reviews.



## _Notice_
Location data is collected manually. As such addresses, prices, and descriptions may be out of date.


