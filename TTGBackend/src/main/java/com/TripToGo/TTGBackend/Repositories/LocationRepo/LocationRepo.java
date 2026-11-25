package com.TripToGo.TTGBackend.Repositories.LocationRepo;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class LocationRepo {
    private static final int LOCATION_LOCK_NAMESPACE = "review location".hashCode();

    private final JdbcTemplate jdbc;

    public LocationRepo(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    public void lockLocationIdentity(String key) {
        jdbc.queryForObject("select 1 from pg_advisory_xact_lock(?, ?)", Integer.class,
                LOCATION_LOCK_NAMESPACE, key.hashCode());
    }
}
