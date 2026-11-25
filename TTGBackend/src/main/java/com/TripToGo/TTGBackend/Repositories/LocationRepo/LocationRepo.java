package com.TripToGo.TTGBackend.Repositories.LocationRepo;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

/** Provides PostgreSQL advisory locking for location writes. */
@Repository
public class LocationRepo {
    private static final int LOCATION_LOCK_NAMESPACE = "review location".hashCode();

    private final JdbcTemplate jdbc;

    public LocationRepo(JdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Serializes location writes for the same name and address, even before a location row exists.
     * Call inside a transaction before checking for an existing location. PostgreSQL releases the
     * lock when that transaction commits or rolls back.
     *
     * @param key normalized name, country, province, city, and barangay joined by newlines and
     *            lowercased with {@link java.util.Locale#ROOT}
     */
    public void lockLocationIdentity(String key) {
        jdbc.queryForObject("select 1 from pg_advisory_xact_lock(?, ?)", Integer.class,
                LOCATION_LOCK_NAMESPACE, key.hashCode());
    }
}
